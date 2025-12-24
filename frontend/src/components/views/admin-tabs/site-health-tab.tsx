import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Server,
  Database,
  Wifi,
  Shield,
  Zap,
  HardDrive
} from 'lucide-react';

const SiteHealthTab = () => {
  const [healthStatus, setHealthStatus] = useState({
    overall: 'good',
    lastChecked: '2023-06-15 14:30:22',
    issues: 2
  });

  const [checks, setChecks] = useState([
    {
      id: 1,
      name: 'Server Response',
      status: 'good',
      description: 'Server is responding normally',
      lastChecked: '2023-06-15 14:30:22'
    },
    {
      id: 2,
      name: 'Database Connection',
      status: 'good',
      description: 'Database is connected and responsive',
      lastChecked: '2023-06-15 14:30:22'
    },
    {
      id: 3,
      name: 'SSL Certificate',
      status: 'warning',
      description: 'Certificate expires in 30 days',
      lastChecked: '2023-06-15 14:30:22'
    },
    {
      id: 4,
      name: 'Disk Space',
      status: 'critical',
      description: 'Storage is 95% full',
      lastChecked: '2023-06-15 14:30:22'
    },
    {
      id: 5,
      name: 'Cache Performance',
      status: 'good',
      description: 'Cache is functioning optimally',
      lastChecked: '2023-06-15 14:30:22'
    },
    {
      id: 6,
      name: 'Security Updates',
      status: 'good',
      description: 'All security patches are up to date',
      lastChecked: '2023-06-15 14:30:22'
    }
  ]);

  const handleRefresh = () => {
    // Refresh logic would go here
    console.log('Refreshing site health check');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Site Health</h2>
          <p className="text-muted-foreground">
            Monitor your site's performance and identify issues
          </p>
        </div>
        <Button onClick={handleRefresh}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Status</CardTitle>
            <CardDescription>
              Current health of your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(healthStatus.overall)}`}></div>
              <div className="text-2xl font-bold capitalize">{healthStatus.overall}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Last checked: {healthStatus.lastChecked}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Issues</CardTitle>
            <CardDescription>
              Problems requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{healthStatus.issues}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {healthStatus.issues === 1 ? 'issue needs attention' : 'issues need attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Score</CardTitle>
            <CardDescription>
              Overall site performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87/100</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Checks</CardTitle>
          <CardDescription>
            Detailed status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checks.map((check) => (
              <div key={check.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getStatusIcon(check.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{check.name}</h3>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last checked: {check.lastChecked}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    check.status === 'good' ? 'default' : 
                    check.status === 'warning' ? 'secondary' : 'destructive'
                  }>
                    {check.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Actions to improve site health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Renew SSL Certificate</h4>
                  <p className="text-sm text-muted-foreground">
                    Your SSL certificate expires in 30 days. Renew it to avoid security warnings.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Renew Now
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Free Up Disk Space</h4>
                  <p className="text-sm text-muted-foreground">
                    Storage is 95% full. Delete unnecessary files or upgrade your storage plan.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Manage Storage
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Technical details about your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Server: nginx/1.20.1</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Database: MySQL 8.0.27</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">PHP Version: 8.1.12</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Security: Up to date</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Cache: Redis 6.2.6</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Storage: 95% used (19GB/20GB)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteHealthTab;