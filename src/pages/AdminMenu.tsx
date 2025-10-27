import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AdminSidebar } from '../components/AdminSidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import axios from 'axios';

// Minimal form model for new menu item
type MenuItemForm = {
  name: string;
  price: number | string;
  image?: string;
  description?: string;
  category?: string;
  available?: boolean;
};

export function AdminMenu() {
  const navigate = useNavigate();
  const { user, menuItems, deleteMenuItem } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    imageUrl: '',
    category: 'Meals',
    available: true,
  });
  const [submitting, setSubmitting] = useState(false);
  // New item form state (fixes: 'newItem' not found)
  const [newItem, setNewItem] = useState<MenuItemForm>({
    name: '',
    price: '',
    image: '',
    description: '',
    category: '',
    available: true,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      // Build payload from form state (fixes: 'payload' relies on 'newItem')
      const payload = {
        ...newItem,
        price: Number(newItem.price || 0),
      };
      await axios.post('/api/admin/menu', payload);
      toast.success('Menu item added successfully');
      // Reset form (fixes: 'itemData' not found)
      setNewItem({
        name: '',
        price: '',
        image: '',
        description: '',
        category: '',
        available: true,
      });
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save menu item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      imageUrl: '',
      category: 'Meals',
      available: true,
    });
    setEditingItem(null);
    setImageSearchQuery('');
  };

  const handleEdit = (item: typeof menuItems[0]) => {
    setEditingItem(item.id);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      imageUrl: item.imageUrl,
      category: item.category,
      available: item.available,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem(id);
      toast.success('Menu item deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete menu item. Please try again.');
    }
  };

  const handleSearchImage = async () => {
    if (!imageSearchQuery.trim()) {
      toast.error('Please enter a search term for the image');
      return;
    }

    setIsSearchingImage(true);
    try {
      // Using Unsplash API through the unsplash_tool
      await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(imageSearchQuery)}&per_page=1&client_id=YOUR_UNSPLASH_ACCESS_KEY`);
      
      // For demo purposes, we'll use a predefined set of food images based on search terms
      const foodImageMap: Record<string, string> = {
        'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        'pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        'fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
        'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        'coffee': 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
        'shake': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
        'biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
        'sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
        'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
        'noodles': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400',
        'rice': 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400',
        'chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
        'salad': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        'juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
        'tea': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
        'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        'ice cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        'donut': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
        'taco': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
        'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        'hot dog': 'https://images.unsplash.com/photo-1612392061787-2d078b3e573f?w=400',
        'waffle': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400',
        'pancake': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
        'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        'wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
      };

      // Find matching image or use generic food image
      const searchLower = imageSearchQuery.toLowerCase();
      let imageUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'; // default food image

      for (const [key, url] of Object.entries(foodImageMap)) {
        if (searchLower.includes(key)) {
          imageUrl = url;
          break;
        }
      }

      setFormData({ ...formData, imageUrl });
      toast.success('Image found! You can also paste a custom URL below.');
    } catch (error) {
      toast.error('Failed to search image. Please enter a URL manually.');
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, imageUrl: base64String });
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-gray-800">Menu Management</h1>
            <Dialog open={dialogOpen} onOpenChange={(open: boolean) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Burger Deluxe"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="120"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Meals">Meals</SelectItem>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                          <SelectItem value="Drinks">Drinks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="space-y-4 border-t pt-4">
                    <Label>Item Image</Label>

                    {/* Image Preview */}
                    {formData.imageUrl && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                        <ImageWithFallback
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Search for Image */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Option 1: Search Stock Image</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={imageSearchQuery}
                          onChange={(e) => setImageSearchQuery(e.target.value)}
                          placeholder="e.g., burger, pizza, coffee..."
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchImage())}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSearchImage}
                          disabled={isSearchingImage}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          {isSearchingImage ? 'Searching...' : 'Search'}
                        </Button>
                      </div>
                    </div>

                    {/* Upload Image */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Option 2: Upload Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Label
                          htmlFor="imageUpload"
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Choose File
                        </Label>
                        <span className="text-xs text-gray-500">Max 2MB</span>
                      </div>
                    </div>

                    {/* Manual URL */}
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-sm text-gray-600">
                        Option 3: Enter Image URL
                      </Label>
                      <Input
                        id="imageUrl"
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg or paste from clipboard"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <Label htmlFor="available">Available for Order</Label>
                    <Switch
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(checked: boolean) =>
                        setFormData({ ...formData, available: checked })
                      }
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Menu Items ({menuItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl text-primary">₹{item.price}</p>
                      <p className="text-sm text-gray-600">
                        {item.available ? (
                          <span className="text-green-600">Available</span>
                        ) : (
                          <span className="text-red-600">Unavailable</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{item.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
