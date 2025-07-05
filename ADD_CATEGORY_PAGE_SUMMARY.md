# ➕ صفحة إضافة فئة جديدة - Add Category

## ✅ **ما تم إنجازه**

### **1. إنشاء صفحة AddCategory.jsx كاملة:**

#### **الميزات الأساسية:**
```javascript
// State management
const [formData, setFormData] = useState({
  name: '',
  slug: '',
  description: '',
  image: '',
  status: 'active',
  featured: false,
  metaTitle: '',
  metaDescription: '',
  sortOrder: 0,
});

const [imageFile, setImageFile] = useState(null);
const [imagePreview, setImagePreview] = useState('');
const [errors, setErrors] = useState({});
```

#### **Auto-generate Slug:**
```javascript
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Auto-generate slug when name changes
if (name === 'name') {
  setFormData(prev => ({
    ...prev,
    slug: generateSlug(value)
  }));
}
```

#### **Image Upload to Firebase Storage:**
```javascript
const uploadImage = async () => {
  if (!imageFile) return '';

  try {
    setImageUploading(true);
    const imageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  } finally {
    setImageUploading(false);
  }
};
```

#### **Form Validation:**
```javascript
const validateForm = () => {
  const newErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = 'Category name is required';
  }

  if (!formData.slug.trim()) {
    newErrors.slug = 'Slug is required';
  }

  if (!formData.description.trim()) {
    newErrors.description = 'Description is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

#### **Save to Firebase:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  try {
    setIsLoading(true);
    console.log('📂 Creating new category...');

    // Upload image if selected
    let imageUrl = formData.image;
    if (imageFile) {
      imageUrl = await uploadImage();
    }

    // Prepare category data
    const categoryData = {
      ...formData,
      image: imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'categories'), categoryData);
    console.log('✅ Category created with ID:', docRef.id);

    // Navigate back to categories list
    navigate('/admin/categories');
  } catch (error) {
    console.error('❌ Error creating category:', error);
    alert('Error creating category. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

### **2. واجهة المستخدم المتقدمة:**

#### **Header مع Navigation:**
```javascript
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-4">
    <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-gray-600">
      <ArrowLeftIcon className="h-5 w-5" />
    </button>
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
      <p className="text-gray-600">Create a new travel category</p>
    </div>
  </div>
</div>
```

#### **Basic Information Card:**
```javascript
<Card className="p-6">
  <div className="flex items-center space-x-2 mb-4">
    <TagIcon className="h-5 w-5 text-blue-600" />
    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Category Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category Name *
      </label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors.name ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Enter category name"
      />
      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
    </div>

    {/* Slug */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Slug *
      </label>
      <input
        type="text"
        name="slug"
        value={formData.slug}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors.slug ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="category-slug"
      />
      {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
      <p className="text-gray-500 text-xs mt-1">URL-friendly version of the name</p>
    </div>
  </div>

  {/* Description */}
  <div className="mt-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Description *
    </label>
    <textarea
      name="description"
      value={formData.description}
      onChange={handleInputChange}
      rows={4}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        errors.description ? 'border-red-500' : 'border-gray-300'
      }`}
      placeholder="Enter category description"
    />
    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
  </div>
</Card>
```

#### **Image Upload Card:**
```javascript
<Card className="p-6">
  <div className="flex items-center space-x-2 mb-4">
    <PhotoIcon className="h-5 w-5 text-blue-600" />
    <h3 className="text-lg font-semibold text-gray-900">Category Image</h3>
  </div>

  <div className="space-y-4">
    {/* File Upload */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Image
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
    </div>

    {/* Image Preview */}
    {imagePreview && (
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
        <img
          src={imagePreview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
        />
      </div>
    )}

    {/* Or Image URL */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Or Image URL
      </label>
      <input
        type="url"
        name="image"
        value={formData.image}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        placeholder="https://example.com/image.jpg"
      />
    </div>
  </div>
</Card>
```

#### **Settings Card:**
```javascript
<Card className="p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Status */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Status
      </label>
      <select
        name="status"
        value={formData.status}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    {/* Sort Order */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Sort Order
      </label>
      <input
        type="number"
        name="sortOrder"
        value={formData.sortOrder}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        placeholder="0"
      />
    </div>

    {/* Featured */}
    <div className="flex items-center">
      <input
        type="checkbox"
        name="featured"
        checked={formData.featured}
        onChange={handleInputChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label className="ml-2 block text-sm text-gray-700">
        Featured Category
      </label>
    </div>
  </div>
</Card>
```

#### **Action Buttons:**
```javascript
<div className="flex justify-end space-x-4">
  <Button
    type="button"
    onClick={handleCancel}
    variant="outline"
    className="px-6 py-2"
  >
    <XMarkIcon className="h-4 w-4 mr-2" />
    Cancel
  </Button>
  <Button
    type="submit"
    disabled={isLoading || imageUploading}
    className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
  >
    {isLoading || imageUploading ? (
      <LoadingSpinner size="small" className="mr-2" />
    ) : (
      <CheckIcon className="h-4 w-4 mr-2" />
    )}
    {isLoading ? 'Creating...' : imageUploading ? 'Uploading...' : 'Create Category'}
  </Button>
</div>
```

### **3. تحديث App.jsx:**
```javascript
// إضافة import
import AddCategory from './pages/admin/AddCategory';

// تحديث route
<Route path="categories/new" element={<AddCategory />} />
```

## 🎯 **الميزات المتاحة**

### **صفحة إضافة فئة (`/admin/categories/new`):**
```
✅ نموذج شامل لإدخال بيانات الفئة
✅ Auto-generate slug من الاسم
✅ رفع صور إلى Firebase Storage
✅ معاينة الصور قبل الرفع
✅ إدخال URL للصور كبديل
✅ التحقق من صحة البيانات
✅ رسائل خطأ واضحة
✅ حالات مختلفة (Active, Inactive, Draft)
✅ خيار Featured Category
✅ ترتيب الفئات (Sort Order)
✅ Loading states أثناء الحفظ والرفع
✅ Navigation للعودة للقائمة
✅ تصميم متجاوب ومتقدم
```

### **الحقول المتاحة:**
```
✅ Category Name (مطلوب)
✅ Slug (مطلوب - يتم إنشاؤه تلقائياً)
✅ Description (مطلوب)
✅ Image Upload (اختياري)
✅ Image URL (اختياري)
✅ Status (Active/Inactive/Draft)
✅ Featured (checkbox)
✅ Sort Order (رقم)
```

### **العمليات:**
```
✅ Create: حفظ الفئة في Firebase
✅ Upload: رفع الصور إلى Firebase Storage
✅ Validate: التحقق من البيانات المطلوبة
✅ Navigate: العودة لقائمة الفئات بعد الحفظ
✅ Cancel: إلغاء والعودة بدون حفظ
```

## 🔗 **الروابط التي تعمل**

### **للإدارة:**
```
✅ http://localhost:3000/admin/categories/new      - صفحة إضافة فئة جديدة
✅ العودة إلى /admin/categories بعد الحفظ
✅ إلغاء والعودة إلى /admin/categories
```

## 🌟 **الخلاصة**

**تم إنشاء صفحة إضافة فئة جديدة بنجاح!**

### **الميزات المحققة:**
- 📝 **نموذج شامل**: لجميع بيانات الفئة
- 🖼️ **رفع صور**: إلى Firebase Storage مع معاينة
- ✅ **التحقق من البيانات**: مع رسائل خطأ واضحة
- 🔄 **Auto-generate slug**: من اسم الفئة
- 💾 **حفظ في Firebase**: مع timestamps
- 🎨 **واجهة احترافية**: مع loading states وanimations
- 📱 **تصميم متجاوب**: يعمل على جميع الأجهزة

### **الخطوات التالية:**
- ✏️ **إنشاء صفحة تعديل فئة**: `/admin/categories/{id}/edit`
- 👀 **إنشاء صفحة عرض الفئة للعملاء**: `/categories/{slug}`
- 🔗 **ربط الفئات بالرحلات والفنادق**: في نماذج الإضافة والتعديل

**الآن يمكن إضافة فئات جديدة بسهولة من خلال واجهة احترافية!** ✨🚀🎉
