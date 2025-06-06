
import { Sidebar as SidebarComponent, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, GitCompareArrows, LineChart, Bot, LogOut, User, Package, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Sidebar() {
  const location = useLocation();
  const { user, signOut, hasRole } = useAuth();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsername() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching username:', error);
          return;
        }
        
        setUsername(data?.username);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    fetchUsername();
  }, [user]);

  // Extraer iniciales del usuario para el avatar
  const getInitials = () => {
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <SidebarComponent>
      <div className="flex flex-col items-center p-4 border-b border-border">
        <img src="/lovable-uploads/56fdf621-46ac-43d0-873e-c2676b134d9b.png" alt="Behumax Logo" className="h-6 mt-4 mb-6" />
        <div className="flex items-center w-full">
          <Avatar className="rounded-full h-8 w-8 mr-4">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{username || (user ? user.email : "Invitado")}</span>
        </div>
      </div>
      
      <SidebarContent className="flex flex-col h-full justify-between">
        <div>
          {/* Todos los usuarios pueden ver el apartado de Chatbot con IA */}
          <SidebarGroup>
            <SidebarGroupLabel>Chatbot con IA</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarNavItem icon={<LayoutDashboard size={20} />} label="Dashboard" to="/" isActive={location.pathname === '/'} />
                <SidebarNavItem icon={<MessageSquare size={20} />} label="Conversaciones" to="/conversaciones" isActive={location.pathname === '/conversaciones'} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Todos los usuarios pueden ver el Panel de Inteligencia */}
          <SidebarGroup>
            <SidebarGroupLabel>Panel de inteligencia</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarNavItem icon={<GitCompareArrows size={20} />} label="Derivaciones" to="/derivaciones" isActive={location.pathname === '/derivaciones'} />
                <SidebarNavItem icon={<LineChart size={20} />} label="Insights de Productos" to="/insights" isActive={location.pathname === '/insights'} />
                {/* Solo Super Administradores pueden ver IA sobre las conversaciones */}
                {hasRole('super_admin') && (
                  <SidebarNavItem 
                    icon={<Bot size={20} />} 
                    label="IA sobre las conversaciones" 
                    to="/ia-chat" 
                    isActive={location.pathname === '/ia-chat'}
                    textColor="text-gray-400" 
                  />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
        
        <div className="mb-4">
          {/* Solo los administradores y super administradores pueden ver Gestión */}
          {hasRole('admin') && (
            <SidebarGroup>
              <SidebarGroupLabel>Gestión</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarNavItem 
                    icon={<Package size={20} />} 
                    label="Productos" 
                    to="/productos" 
                    isActive={location.pathname === '/productos'} 
                  />
                  <SidebarNavItem 
                    icon={<Users size={20} />} 
                    label="Usuarios" 
                    to="/usuarios" 
                    isActive={location.pathname === '/usuarios'} 
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Todos los usuarios pueden gestionar su cuenta */}
          {user && (
            <SidebarGroup>
              <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarNavItem icon={<User size={20} />} label="Mi perfil" to="/perfil" isActive={location.pathname === '/perfil'} />
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-3 w-full px-3 py-2 text-red-500 hover:bg-red-50" onClick={() => signOut()}>
                      <LogOut size={20} />
                      <span>Cerrar sesión</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>
      </SidebarContent>
    </SidebarComponent>
  );
}

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
  disabled?: boolean;
  textColor?: string;
}

function SidebarNavItem({ icon, label, to, isActive, disabled, textColor }: SidebarNavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2",
          isActive && "bg-primary text-primary-foreground font-bold",
          disabled && "text-muted-foreground cursor-not-allowed",
          textColor
        )}
        aria-disabled={disabled}
      >
        <Link
          to={disabled ? '#' : to}
          className={cn("flex items-center gap-3 w-full")}
          onClick={e => disabled && e.preventDefault()}
        >
          {icon}
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default Sidebar;
