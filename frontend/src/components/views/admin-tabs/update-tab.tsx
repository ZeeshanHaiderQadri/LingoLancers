import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Code,
  Database
} from 'lucide-react';

const UpdateTab = () => {
  const [updateStatus, setUpdateStatus] = useState({
    currentVersion: '1.2.4',
    latestVersion: '1.3.0',
    updateAvailable: true,
    lastChecked: '2023-06-15 14:30:22'
  });

  const [updateHistory, setUpdateHistory] = useState([
    {
      id: 1,
      version: '1.2.4',
      date: '2023-06-10',
      type: 'minor',
      description: 'Security patches and bug fixes'
    },
    {
      id: 2,
      version: '1.2.3',
      date: '2023-05-22',
      type: 'minor',
      description: 'Performance improvements'
    },
    {
      id: 3,
      version: '1.2.2',
      date: '2023-05-15',
      type: 'patch',
      description: 'Bug fixes and stability improvements'
    },
    {
      id: 4,
      version: '1.2.1',
      date: '2023-05-01',
      type: 'patch',
      description: 'Minor bug fixes'
    },
    {
      id: 5,
      version: '1.2.0',
      date: '2023-04-15',
      type: 'major',
      description: 'New dashboard and improved workflows'
    }
  ]);

  const [changelog] = useState([
    {
      version: '1.3.0',
      date: '2023-06-20',
      changes: [
        { type: 'feature', description: 'Added new analytics dashboard' },
        { type: 'feature', description: 'Implemented real-time notifications' },
        { type: 'improvement', description: 'Improved performance by 30%' },
        { type: 'security', description: 'Added two-factor authentication' },
        { type: 'bugfix', description: 'Fixed login issues on mobile devices' }
      ]
    }
  ]);

  const handleCheckUpdates = () => {
    // Check for updates logic would go here
    console.log('Checking for updates');
  };

  const handleUpdate = () => {
    // Update logic would go here
    console.log('Starting update process');
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <span className="text-green-500">✨</span>;
      case 'improvement':
        return <span className="text-blue-500">⬆️</span>;
      case 'security':
        return <span className="text-red-500">🔒</span>;
      case 'bugfix':
        return <span className="text-yellow-500">🐛</span>;
      default:
        return <span>📝</span>;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-green-100 text-green-800';
      case 'improvement':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'bugfix':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Updates</h2>
          <p className="text-muted-foreground">
            Keep your system up to date with the latest features and security patches
          </p>
        </div>
        <Button onClick={handleCheckUpdates}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Check for Updates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Version</CardTitle>
            <CardDescription>
              Your system version
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{updateStatus.currentVersion}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Released on April 15, 2023
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Version</CardTitle>
            <CardDescription>
              Available update
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{updateStatus.latestVersion}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Released on June 20, 2023
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
            <CardDescription>
              System update information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {updateStatus.updateAvailable ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-yellow-500">Update Available</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-500">Up to Date</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Last checked: {updateStatus.lastChecked}
            </p>
            {updateStatus.updateAvailable && (
              <Button onClick={handleUpdate} className="mt-3 w-full">
                <Download className="mr-2 h-4 w-4" />
                Update Now
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {updateStatus.updateAvailable && (
        <Card>
          <CardHeader>
            <CardTitle>What's New in {updateStatus.latestVersion}</CardTitle>
            <CardDescription>
              Changes and improvements in the latest version
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {changelog[0].changes.map((change, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    {getChangeTypeIcon(change.type)}
                  </div>
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getChangeTypeColor(change.type)}`}>
                      {change.type}
                    </span>
                    <p className="mt-1">{change.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Update History</CardTitle>
          <CardDescription>
            Previous versions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updateHistory.map((update) => (
              <div key={update.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted rounded-lg flex items-center justify-center w-12 h-12">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Version {update.version}</h3>
                    <p className="text-sm text-muted-foreground">{update.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{update.date}</span>
                      <Badge variant="secondary">{update.type}</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Settings</CardTitle>
          <CardDescription>
            Configure automatic updates and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Automatic Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically install minor updates
                </p>
              </div>
              <Button variant="outline">
                Enable
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Major Update Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when major updates are available
                </p>
              </div>
              <Button variant="outline">
                Enable
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Security Patch Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Immediate notifications for security updates
                </p>
              </div>
              <Button variant="default">
                Enabled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateTab;