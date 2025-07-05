import { Trip, Tag } from '../models/index.js';
import { createSuccessResponse, createErrorResponse, AppError } from '../middleware/errorHandler.js';
import { generateSlug } from '../utils/helpers.js';
import { trackPageView } from '../middleware/analytics.js';

// Get all trips with filters and pagination
export const getAllTrips = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      difficulty: req.query.difficulty,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      search: req.query.q || req.query.search,
      tags: req.query.tags ? req.query.tags.split(',') : null,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await Trip.findAll(filters);

    res.json(createSuccessResponse(
      result.trips,
      'Trips retrieved successfully',
      { pagination: result.pagination, filters }
    ));
  } catch (error) {
    next(error);
  }
};

// Get featured trips
export const getFeaturedTrips = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const trips = await Trip.getFeatured(limit);

    res.json(createSuccessResponse(
      trips,
      'Featured trips retrieved successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Get trip by ID or slug
export const getTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    let trip;

    // Check if it's a UUID or slug
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      trip = await Trip.findById(id);
    } else {
      trip = await Trip.findBySlug(id);
    }

    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }

    // Get trip tags
    const tags = await Tag.findByTripId(trip.id);
    trip.tags = tags;

    res.json(createSuccessResponse(
      trip,
      'Trip retrieved successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Create new trip (Admin only)
export const createTrip = async (req, res, next) => {
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      durationDays,
      maxParticipants,
      difficultyLevel,
      categoryId,
      itinerary,
      includedServices,
      excludedServices,
      departureDates,
      featured,
      metaTitle,
      metaDescription,
      tags
    } = req.body;

    // Generate slug from title
    const slug = generateSlug(title);

    // Handle main image
    const mainImage = req.files?.mainImage?.[0]?.url || req.file?.url;
    if (!mainImage) {
      return next(new AppError('Main image is required', 400));
    }

    // Handle gallery images
    const gallery = req.files?.gallery?.map(file => file.url) || [];

    const tripData = {
      title,
      slug,
      description,
      shortDescription,
      mainImage,
      gallery,
      price: parseFloat(price),
      durationDays: parseInt(durationDays),
      maxParticipants: parseInt(maxParticipants),
      difficultyLevel,
      categoryId,
      itinerary: typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary,
      includedServices: Array.isArray(includedServices) ? includedServices : includedServices?.split(',') || [],
      excludedServices: Array.isArray(excludedServices) ? excludedServices : excludedServices?.split(',') || [],
      departureDates: Array.isArray(departureDates) ? departureDates : departureDates?.split(',') || [],
      featured: featured === 'true',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription
    };

    const trip = await Trip.create(tripData);

    // Add tags if provided
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : tags.split(',');
      for (const tagId of tagIds) {
        await Tag.addToTrip(tagId.trim(), trip.id);
      }
    }

    res.status(201).json(createSuccessResponse(
      trip,
      'Trip created successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Update trip (Admin only)
export const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }

    const updateData = { ...req.body };

    // Update slug if title changed
    if (updateData.title && updateData.title !== trip.title) {
      updateData.slug = generateSlug(updateData.title);
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
    if (updateData.itinerary && typeof updateData.itinerary === 'string') {
      updateData.itinerary = JSON.parse(updateData.itinerary);
    }

    // Parse array fields
    ['includedServices', 'excludedServices', 'departureDates'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        updateData[field] = updateData[field].split(',').map(item => item.trim());
      }
    });

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.durationDays) updateData.durationDays = parseInt(updateData.durationDays);
    if (updateData.maxParticipants) updateData.maxParticipants = parseInt(updateData.maxParticipants);
    if (updateData.featured) updateData.featured = updateData.featured === 'true';

    await trip.update(updateData);

    // Update tags if provided
    if (req.body.tags !== undefined) {
      // Remove existing tags
      const existingTags = await Tag.findByTripId(trip.id);
      for (const tag of existingTags) {
        await Tag.removeFromTrip(tag.id, trip.id);
      }

      // Add new tags
      if (req.body.tags) {
        const tagIds = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',');
        for (const tagId of tagIds) {
          await Tag.addToTrip(tagId.trim(), trip.id);
        }
      }
    }

    res.json(createSuccessResponse(
      trip,
      'Trip updated successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Delete trip (Admin only)
export const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }

    await trip.delete();

    res.json(createSuccessResponse(
      null,
      'Trip deleted successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Get trip statistics (Admin only)
export const getTripStats = async (req, res, next) => {
  try {
    const stats = await Trip.getStats();

    res.json(createSuccessResponse(
      stats,
      'Trip statistics retrieved successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Search trips
export const searchTrips = async (req, res, next) => {
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
      difficulty: req.query.difficulty,
      tags: req.query.tags ? req.query.tags.split(',') : null,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await Trip.findAll(filters);

    res.json(createSuccessResponse(
      result.trips,
      `Found ${result.pagination.total} trips matching "${searchTerm}"`,
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

// Get trips by category
export const getTripsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    
    const filters = {
      category: categoryId,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 12,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await Trip.findAll(filters);

    res.json(createSuccessResponse(
      result.trips,
      'Trips retrieved successfully',
      { pagination: result.pagination }
    ));
  } catch (error) {
    next(error);
  }
};

// Toggle trip featured status (Admin only)
export const toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }

    await trip.update({ featured: !trip.featured });

    res.json(createSuccessResponse(
      trip,
      `Trip ${trip.featured ? 'featured' : 'unfeatured'} successfully`
    ));
  } catch (error) {
    next(error);
  }
};
