import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useUpdateProfile } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfilePageSkeleton } from '@/components/loaders/PageSkeletons';

export function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const { mutate: updateProfile } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Для просмотра профиля необходимо войти</p>
        <Link to="/login">
          <Button>Войти</Button>
        </Link>
      </div>
    );
  }

  const handleStartEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setEditUsername(user.username);
    setIsEditing(true);
  };

  const handleUpdateProfile = () => {
    updateProfile(
      { username: editUsername },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {user.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Имя пользователя"
                  />
                  <Button onClick={handleUpdateProfile}>Сохранить</Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartEdit}
                    className="mt-2"
                  >
                    Изменить имя
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}