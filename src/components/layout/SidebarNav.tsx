
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Bell, 
  List, 
  User, 
  Package, 
  BellPlus,
  FileText,
  Heart,
  Eye,
  Users,
  Briefcase,
  Save,
  Search,
  ChevronRight
} from 'lucide-react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarNavProps {
  collapsed?: boolean;
}

const SidebarNav = ({ collapsed = false }: SidebarNavProps) => {
  const { session } = useAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    listings: false,
    account: false
  });

  const toggleSection = (section: string) => {
    if (collapsed) return;
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      title: 'My OpenSooq',
      path: '/',
      icon: Home
    },
    {
      title: 'Chats',
      path: '/chats',
      icon: MessageSquare
    },
    {
      title: 'Notifications',
      path: '/notifications',
      icon: Bell
    },
    {
      title: 'Listings',
      icon: List,
      expandable: true,
      section: 'listings',
      subItems: [
        { title: 'My Listings', path: '/my-listings', icon: List },
        { title: 'Draft Listings', path: '/draft-listings', icon: FileText },
        { title: 'Favorite Listings', path: '/favorite-listings', icon: Heart },
        { title: 'Recently Viewed', path: '/recently-viewed', icon: Eye },
        { title: 'Following Listings', path: '/following-listings', icon: Users },
        { title: 'Job Applications', path: '/job-applications', icon: Briefcase },
        { title: 'Saved Searches', path: '/saved-searches', icon: Save },
        { title: 'Recent Searches', path: '/recent-searches', icon: Search }
      ]
    },
    {
      title: 'Account',
      icon: User,
      expandable: true,
      section: 'account',
      path: '/profile'
    },
    {
      title: 'Products',
      path: '/products',
      icon: Package
    },
    {
      title: 'Invite Friends',
      path: '/invite-friends',
      icon: BellPlus
    }
  ];

  return (
    <nav className={cn(
      "bg-white dark:bg-gray-800 h-full flex flex-col py-4",
      collapsed ? "w-16" : "w-64",
      "transition-width duration-300"
    )}>
      <ul className="space-y-2 px-2">
        {navItems.map((item, index) => (
          <li key={index}>
            {item.expandable ? (
              <Collapsible
                open={!collapsed && openSections[item.section]}
                onOpenChange={() => toggleSection(item.section)}
              >
                <CollapsibleTrigger className={cn(
                  "flex items-center justify-between w-full p-2 text-base font-normal text-gray-900 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                  collapsed && "justify-center"
                )}>
                  <div className={cn(
                    "flex items-center",
                    collapsed ? "justify-center w-full" : ""
                  )}>
                    <item.icon className="w-6 h-6" />
                    {!collapsed && <span className="ml-3">{item.title}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronRight 
                      className={cn(
                        "w-4 h-4 transition-transform",
                        openSections[item.section] ? "transform rotate-90" : ""
                      )} 
                    />
                  )}
                </CollapsibleTrigger>
                {!collapsed && (
                  <CollapsibleContent className="pl-11">
                    <ul className="py-2 space-y-2">
                      {item.subItems?.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={subItem.path}
                            className={cn(
                              "flex items-center p-2 text-base font-normal rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                              isActive(subItem.path) 
                                ? "bg-gray-100 dark:bg-gray-700 text-blue-500" 
                                : "text-gray-900 dark:text-white"
                            )}
                          >
                            <subItem.icon className="w-5 h-5 mr-2" />
                            <span>{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                )}
              </Collapsible>
            ) : (
              <Link
                to={item.path}
                className={cn(
                  "flex items-center p-2 text-base font-normal rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                  isActive(item.path) 
                    ? "bg-gray-100 dark:bg-gray-700 text-blue-500" 
                    : "text-gray-900 dark:text-white",
                  collapsed ? "justify-center" : ""
                )}
              >
                <item.icon className="w-6 h-6" />
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;
