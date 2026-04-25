import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useUser, useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { User, List, LogOut } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Layout() {
  const { data: user } = useUser();
  const { logout } = useAuth();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  const handleLogoClick = () => {
    // Clear search query when clicking on logo
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold" onClick={handleLogoClick}>
            AnimeHako
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`hover:text-primary transition-colors ${
                location.pathname === '/' ? 'text-primary font-medium' : ''
              }`}
            >
              Каталог
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span className="cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || undefined} alt={user.username} />
                      <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="w-4 h-4 mr-2" />
                      Профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link to="/profile/anime" className="flex items-center w-full">
                      <List className="w-4 h-4 mr-2" />
                      Мой список
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">Вход</Button>
                </Link>
                <Link to="/register">
                  <Button>Регистрация</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
