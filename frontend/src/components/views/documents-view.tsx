
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FolderPlus, Folder, FileText, MoreVertical, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const folders = [
    { name: "AI Generated Articles", fileCount: 12, size: "1.2MB" },
    { name: "Social Media Posts", fileCount: 45, size: "5.8MB" },
    { name: "Product Descriptions", fileCount: 150, size: "800KB" },
    { name: "Training Data", fileCount: 5, size: "25MB" },
];

const files = [
    { name: "Future of Renewable Energy.docx", type: "Article", size: "150KB", lastModified: "2024-09-29" },
    { name: "Marketing_Campaign_Q4.pdf", type: "Report", size: "2.3MB", lastModified: "2024-09-28" },
    { name: "New_Logo_Final.png", type: "Image", size: "512KB", lastModified: "2024-09-28" },
    { name: "Website_Copy_v3.txt", type: "Text", size: "25KB", lastModified: "2024-09-27" },
];

export default function DocumentsView() {
  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold font-headline tracking-tight">Documents</h2>
                <p className="text-muted-foreground">Manage, upload, and organize all your files and folders.</p>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                </Button>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                </Button>
            </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 flex-1">
            <div className="md:col-span-1">
                <Card className="bg-card/50 h-full">
                    <CardHeader>
                        <CardTitle>Folders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                           {folders.map(folder => (
                               <li key={folder.name}>
                                   <Button variant="ghost" className="w-full justify-start gap-2 text-base px-2">
                                       <Folder className="h-5 w-5 text-primary"/>
                                       <span className="truncate">{folder.name}</span>
                                       <Badge variant="secondary" className="ml-auto">{folder.fileCount}</Badge>
                                   </Button>
                               </li>
                           ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-3">
                <Card className="bg-card/50 h-full">
                    <CardHeader>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Folder className="h-4 w-4 mr-2"/>
                            <span>All Files</span>
                            <ChevronRight className="h-4 w-4 mx-1" />
                            <span className="text-foreground font-medium">AI Generated Articles</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Last Modified</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {files.map((file) => (
                                    <TableRow key={file.name}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            {file.name}
                                        </TableCell>
                                        <TableCell>{file.type}</TableCell>
                                        <TableCell>{file.size}</TableCell>
                                        <TableCell>{file.lastModified}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
