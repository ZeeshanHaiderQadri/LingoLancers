import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Search,
  Filter,
  Menu,
  Link,
  Image as ImageIcon,
  MoveUp,
  MoveDown
} from 'lucide-react';

const MegaMenuTab = () => {
  const [menuSettings, setMenuSettings] = useState({
    enabled: true,
    animation: true,
    columns: 4
  });

  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      title: 'Products',
      url: '/products',
      icon: 'Box',
      order: 1,
      enabled: true,
      submenu: [
        { id: 11, title: 'Software', url: '/products/software', order: 1 },
        { id: 12, title: 'Hardware', url: '/products/hardware', order: 2 },
        { id: 13, title: 'Services', url: '/products/services', order: 3 }
      ]
    },
    {
      id: 2,
      title: 'Solutions',
      url: '/solutions',
      icon: 'Lightbulb',
      order: 2,
      enabled: true,
      submenu: [
        { id: 21, title: 'For Business', url: '/solutions/business', order: 1 },
        { id: 22, title: 'For Developers', url: '/solutions/developers', order: 2 }
      ]
    },
    {
      id: 3,
      title: 'Resources',
      url: '/resources',
      icon: 'Book',
      order: 3,
      enabled: true,
      submenu: [
        { id: 31, title: 'Documentation', url: '/resources/docs', order: 1 },
        { id: 32, title: 'Tutorials', url: '/resources/tutorials', order: 2 },
        { id: 33, title: 'Blog', url: '/blog', order: 3 }
      ]
    }
  ]);

  const [newMenuItem, setNewMenuItem] = useState({
    title: '',
    url: '',
    icon: 'Link'
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving mega menu settings');
  };

  const moveItem = (id: number, direction: 'up' | 'down') => {
    setMenuItems(prevItems => {
      const items = [...prevItems];
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return items;
      
      if (direction === 'up' && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      } else if (direction === 'down' && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      
      return items.map((item, i) => ({ ...item, order: i + 1 }));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mega Menu</h2>
          <p className="text-muted-foreground">
            Configure your site's navigation mega menu
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Settings</CardTitle>
          <CardDescription>
            Configure global mega menu settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Mega Menu</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle to enable or disable the mega menu
                </p>
              </div>
              <Switch 
                checked={menuSettings.enabled} 
                onCheckedChange={(checked) => setMenuSettings({...menuSettings, enabled: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Animation Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Enable smooth dropdown animations
                </p>
              </div>
              <Switch 
                checked={menuSettings.animation} 
                onCheckedChange={(checked) => setMenuSettings({...menuSettings, animation: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="columns">Menu Columns</Label>
              <Input 
                id="columns" 
                type="number"
                min="1"
                max="6"
                value={menuSettings.columns}
                onChange={(e) => setMenuSettings({...menuSettings, columns: parseInt(e.target.value) || 4})}
              />
              <p className="text-sm text-muted-foreground">
                Number of columns in the mega menu dropdown
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>
            Manage your mega menu navigation items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-lg flex items-center justify-center w-12 h-12">
                    <Menu className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Link className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{item.url}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary">{item.submenu.length} items</Badge>
                      <div className="text-sm text-muted-foreground">
                        Order: {item.order}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={item.enabled} />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={item.order === 1}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => moveItem(item.id, 'down')}
                    disabled={item.order === menuItems.length}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Menu Item</CardTitle>
          <CardDescription>
            Create a new item in your mega menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menu-title">Menu Title</Label>
              <Input 
                id="menu-title" 
                value={newMenuItem.title}
                onChange={(e) => setNewMenuItem({...newMenuItem, title: e.target.value})}
                placeholder="Enter menu title" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="menu-url">URL</Label>
              <Input 
                id="menu-url" 
                value={newMenuItem.url}
                onChange={(e) => setNewMenuItem({...newMenuItem, url: e.target.value})}
                placeholder="Enter URL" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="menu-icon">Icon</Label>
              <select 
                id="menu-icon"
                className="w-full p-2 border rounded"
                value={newMenuItem.icon}
                onChange={(e) => setNewMenuItem({...newMenuItem, icon: e.target.value})}
              >
                <option value="Link">Link</option>
                <option value="Box">Box</option>
                <option value="Lightbulb">Lightbulb</option>
                <option value="Book">Book</option>
                <option value="User">User</option>
                <option value="Settings">Settings</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Add Menu Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MegaMenuTab;