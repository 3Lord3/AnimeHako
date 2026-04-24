import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReviewResponse } from '@/types';

interface ReviewsSectionProps {
  reviews?: ReviewResponse[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Обзоры</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4 last:border-0">
            <div className="flex items-center gap-2 mb-2">
              <strong>{review.author_name}</strong>
              {review.score && (
                <Badge variant="outline">{review.score}/10</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <h4 className="font-medium">{review.title}</h4>
            <p className="text-muted-foreground">{review.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}