import { Hotel, Tag } from '../models/index.js';
import { createSuccessResponse, createErrorResponse, AppError } from '../middleware/errorHandler.js';
import { generateSlug } from '../utils/helpers.js';

// Get all hotels with filters and pagination
export const getAllHotels = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      starRating: req.query.starRating ? parseInt(req.query.starRating) : null,
      amenities: req.query.amenities ? req.query.amenities.split(',') : null,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      search: req.query.q || req.query.search,
      tags: req.query.tags ? req.query.tags.split(',') : null,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await Hotel.findAll(filters);

    res.json(createSuccessResponse(
      result.hotels,
      'Hotels retrieved successfully',
      { pagination: result.pagination, filters }
    ));
  } catch (error) {
    next(error);
  }
};

// Get featured hotels
export const getFeaturedHotels = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const hotels = await Hotel.getFeatured(limit);

    res.json(createSuccessResponse(
      hotels,
      'Featured hotels retrieved successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Get hotel by ID or slug
export const getHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    let hotel;

    // Check if it's a UUID or slug
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      hotel = await Hotel.findById(id);
    } else {
      hotel = await Hotel.findBySlug(id);
    }

    if (!hotel) {
      return next(new AppError('Hotel not found', 404));
    }

    // Get hotel tags
    const tags = await Tag.findByHotelId(hotel.id);
    hotel.tags = tags;

    res.json(createSuccessResponse(
      hotel,
      'Hotel retrieved successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Create new hotel (Admin only)
export const createHotel = async (req, res, next) => {
  try {
    const {
      name,
      description,
      shortDescription,
      pricePerNight,
      starRating,
      address,
      city,
      categoryId,
      amenities,
      roomTypes,
      policies,
      featured,
      metaTitle,
      metaDescription,
      tags
    } = req.body;

    // Generate slug from name
    const slug = generateSlug(name);

    // Handle main image
    const mainImage = req.files?.mainImage?.[0]?.url || req.file?.url;
    if (!mainImage) {
      return next(new AppError('Main image is required', 400));
    }

    // Handle gallery images
    const gallery = req.files?.gallery?.map(file => file.url) || [];

    const hotelData = {
      name,
      slug,
      description,
      shortDescription,
      mainImage,
      gallery,
      pricePerNight: parseFloat(pricePerNight),
      starRating: parseInt(starRating),
      address,
      city,
      categoryId,
      amenities: Array.isArray(amenities) ? amenities : amenities?.split(',') || [],
      roomTypes: typeof roomTypes === 'string' ? JSON.parse(roomTypes) : roomTypes || {},
      policies: typeof policies === 'string' ? JSON.parse(policies) : policies || {},
      featured: featured === 'true',
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || shortDescription
    };

    const hotel = await Hotel.create(hotelData);

    // Add tags if provided
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : tags.split(',');
      for (const tagId of tagIds) {
        await Tag.addToHotel(tagId.trim(), hotel.id);
      }
    }

    res.status(201).json(createSuccessResponse(
      hotel,
      'Hotel created successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Update hotel (Admin only)
export const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return next(new AppError('Hotel not found', 404));
    }

    const updateData = { ...req.body };

    // Update slug if name changed
    if (updateData.name && updateData.name !== hotel.name) {
      updateData.slug = generateSlug(updateData.name);
    }

    // Handle file uploads
    if (req.files?.mainImage?.[0]) {
      updateData.mainImage = req.files.mainImage[0].url;
    } else if (req.file) {
      updateData.mainImage = req.file.url;
    }

    if (req.files?.gallery) {
      updateData.gallery = req.files.gallery.map(file => file.url);
    }

    // Parse JSON fields
    if (updateData.roomTypes && typeof updateData.roomTypes === 'string') {
      updateData.roomTypes = JSON.parse(updateData.roomTypes);
    }

    if (updateData.policies && typeof updateData.policies === 'string') {
      updateData.policies = JSON.parse(updateData.policies);
    }

    // Parse array fields
    if (updateData.amenities && typeof updateData.amenities === 'string') {
      updateData.amenities = updateData.amenities.split(',').map(item => item.trim());
    }

    // Convert numeric fields
    if (updateData.pricePerNight) updateData.pricePerNight = parseFloat(updateData.pricePerNight);
    if (updateData.starRating) updateData.starRating = parseInt(updateData.starRating);
    if (updateData.featured) updateData.featured = updateData.featured === 'true';

    await hotel.update(updateData);

    // Update tags if provided
    if (req.body.tags !== undefined) {
      // Remove existing tags
      const existingTags = await Tag.findByHotelId(hotel.id);
      for (const tag of existingTags) {
        await Tag.removeFromHotel(tag.id, hotel.id);
      }

      // Add new tags
      if (req.body.tags) {
        const tagIds = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',');
        for (const tagId of tagIds) {
          await Tag.addToHotel(tagId.trim(), hotel.id);
        }
      }
    }

    res.json(createSuccessResponse(
      hotel,
      'Hotel updated successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Delete hotel (Admin only)
export const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return next(new AppError('Hotel not found', 404));
    }

    await hotel.delete();

    res.json(createSuccessResponse(
      null,
      'Hotel deleted successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Get hotel statistics (Admin only)
export const getHotelStats = async (req, res, next) => {
  try {
    const stats = await Hotel.getStats();

    res.json(createSuccessResponse(
      stats,
      'Hotel statistics retrieved successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Search hotels
export const searchHotels = async (req, res, next) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return next(new AppError('Search term must be at least 2 characters long', 400));
    }

    const filters = {
      search: searchTerm.trim(),
      category: req.query.category,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      starRating: req.query.starRating ? parseInt(req.query.starRating) : null,
      amenities: req.query.amenities ? req.query.amenities.split(',') : null,
      tags: req.query.tags ? req.query.tags.split(',') : null,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await Hotel.findAll(filters);

    res.json(createSuccessResponse(
      result.hotels,
      `Found ${result.pagination.total} hotels matching "${searchTerm}"`,
      { 
        pagination: result.pagination, 
        searchTerm,
        filters 
      }
    ));
  } catch (error) {
    next(error);
  }
};

// Get hotels by category
export const getHotelsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    
    const filters = {
      category: categoryId,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await Hotel.findAll(filters);

    res.json(createSuccessResponse(
      result.hotels,
      'Hotels retrieved successfully',
      { pagination: result.pagination }
    ));
  } catch (error) {
    next(error);
  }
};

// Toggle hotel featured status (Admin only)
export const toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return next(new AppError('Hotel not found', 404));
    }

    await hotel.update({ featured: !hotel.featured });

    res.json(createSuccessResponse(
      hotel,
      `Hotel ${hotel.featured ? 'featured' : 'unfeatured'} successfully`
    ));
  } catch (error) {
    next(error);
  }
};
