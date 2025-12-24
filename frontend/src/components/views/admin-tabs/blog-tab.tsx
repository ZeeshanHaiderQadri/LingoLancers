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
  Eye,
  Calendar,
  User,
  Tag,
  Image as ImageIcon
} from 'lucide-react';

const BlogTab = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Getting Started with Our Platform',
      author: 'Jane Smith',
      date: '2023-06-15',
      status: 'published',
      views: 1240,
      tags: ['Tutorial', 'Getting Started']
    },
    {
      id: 2,
      title: 'Advanced Features Explained',
      author: 'John Doe',
      date: '2023-06-10',
      status: 'draft',
      views: 0,
      tags: ['Advanced', 'Features']
    },
    {
      id: 3,
      title: 'Customer Success Story',
      author: 'Alice Johnson',
      date: '2023-06-05',
      status: 'published',
      views: 892,
      tags: ['Case Study', 'Success']
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: ['']
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving blog post');
  };

  const addTag = () => {
    setNewPost({
      ...newPost,
      tags: [...newPost.tags, '']
    });
  };

  const updateTag = (index: number, value: string) => {
    const updatedTags = [...newPost.tags];
    updatedTags[index] = value;
    setNewPost({
      ...newPost,
      tags: updatedTags
    });
  };

  const removeTag = (index: number) => {
    const updatedTags = [...newPost.tags];
    updatedTags.splice(index, 1);
    setNewPost({
      ...newPost,
      tags: updatedTags
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog Management</h2>
          <p className="text-muted-foreground">
            Create and manage blog posts for your platform
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search posts..." className="pl-8" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Blog Posts</CardTitle>
          <CardDescription>
            Manage your published and draft blog content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-lg flex items-center justify-center w-16 h-16">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{post.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {post.views} views
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
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
          <CardTitle>Create New Blog Post</CardTitle>
          <CardDescription>
            Write and publish a new blog post
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Title</Label>
              <Input 
                id="post-title" 
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="Enter post title" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="post-content">Content</Label>
              <Textarea 
                id="post-content" 
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder="Write your blog post content..." 
                className="min-h-[200px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              {newPost.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    placeholder="Enter tag" 
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeTag(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={addTag}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogTab;