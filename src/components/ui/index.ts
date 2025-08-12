// Main UI Entry Point - Individual component exports
// Core form components
export { Button } from "./button";
export { Input } from "./input";
export { Textarea } from "./textarea";
export { Label } from "./label";
export { Checkbox } from "./checkbox";
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
export { Switch } from "./switch";
export { Progress } from "./progress";

// Layout components
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export { ScrollArea, ScrollBar } from "./scroll-area";

// Interactive components  
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "./dialog";
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuRadioGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuGroup, DropdownMenuShortcut } from "./dropdown-menu";
export { Popover, PopoverContent, PopoverTrigger } from "./popover";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export { Badge } from "./badge";

// Form components
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form";

// Legacy components that still use individual files
export { Calendar } from "./calendar";
// Removed unused Command and Carousel components
export { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarMenuSub, 
  SidebarMenuSubButton, 
  SidebarMenuSubItem, 
  SidebarProvider, 
  SidebarTrigger, 
  useSidebar 
} from "./sidebar";

// Export chart components
export * from "./chart";

// Toast components
export { Toaster } from "./toaster";
export { Toaster as Sonner } from "./sonner";

// Shared utilities
export { cn } from "@/lib/utils";