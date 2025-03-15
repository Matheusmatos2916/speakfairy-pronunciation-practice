
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
      <Avatar className="h-16 w-16">
        {user.picture ? (
          <AvatarImage src={user.picture} alt={user.name} />
        ) : (
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        )}
      </Avatar>
      
      <h3 className="mt-2 text-lg font-medium">{user.name}</h3>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      
      <Button 
        variant="outline" 
        className="mt-4" 
        size="sm"
        onClick={logout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserProfile;
