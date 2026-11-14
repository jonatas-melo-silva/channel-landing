import { useState } from 'react';
import { CircleUser, Users, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ChannelInfo } from '@/lib/channel';

export function ChannelHeader({ channel }: { channel: ChannelInfo }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const name = channel.name ?? channel.key;

  return (
    <header className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        {channel.avatar && !avatarFailed ? (
          <img
            src={channel.avatar}
            alt=""
            className="size-12 shrink-0 rounded-full object-cover"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <CircleUser className="text-muted-foreground size-12 shrink-0" aria-hidden="true" />
        )}
        <h1 className="min-w-0 truncate text-base font-semibold" title={name}>
          {name}
        </h1>
      </div>
      {(channel.subscribers || channel.videos) && (
        <div className="flex flex-wrap gap-2">
          {channel.subscribers && (
            <Badge variant="secondary" data-testid="badge-subscribers">
              <Users aria-hidden="true" />
              {channel.subscribers}
            </Badge>
          )}
          {channel.videos && (
            <Badge variant="secondary" data-testid="badge-videos">
              <Video aria-hidden="true" />
              {channel.videos}
            </Badge>
          )}
        </div>
      )}
    </header>
  );
}
