import { useState } from 'react';
import { UserCheck, UserX, Trash2, MailPlus, Loader2, BellPlus } from 'lucide-react';
import { format } from 'date-fns';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { 
  useAdminUsers, 
  useActivateUser, 
  useDeactivateUser, 
  useDeleteUser,
  useInviteAdmin
} from '../hooks/useAdmin';
import { UserProfileModal } from './UserProfileModal';
import { SendNotificationModal } from './SendNotificationModal';

export function UserManagementTable() {
  const [page, setPage] = useState(0);
  const limit = 10;
  
  const { data, isLoading } = useAdminUsers(page * limit, limit);
  const activate = useActivateUser();
  const deactivate = useDeactivateUser();
  const remove = useDeleteUser();
  const invite = useInviteAdmin();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [notificationUser, setNotificationUser] = useState<{ id: string, email: string } | null>(null);

  const handleNext = () => setPage((p) => p + 1);
  const handlePrev = () => setPage((p) => Math.max(0, p - 1));

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      const res = await invite.mutateAsync(inviteEmail);
      setInviteLink(res.invite_link);
      setInviteEmail('');
    } catch (err) {
      console.error(err);
      alert('Failed to generate invite');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted/20 rounded-xl" />;
  }

  const users = data?.users || [];
  const total = data?.total || 0;
  const maxPage = Math.ceil(total / limit) - 1;

  return (
    <GlassCard className="overflow-hidden">
      <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-sm text-foreground/90 mt-1">Manage platform users, roles, and access statuses.</p>
        </div>
        <Button onClick={() => setShowInvite(!showInvite)} className="gap-2">
          <MailPlus className="h-4 w-4" />
          Invite Admin
        </Button>
      </div>

      {showInvite && (
        <div className="p-6 border-b border-border/50 bg-muted/10">
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Admin Email Address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
              required
            />
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate Link'}
            </Button>
          </form>
          {inviteLink && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
              <p className="text-sm font-medium mb-1">Invite generated! Send this link to the new admin:</p>
              <code className="text-xs break-all select-all">{window.location.origin}{inviteLink}</code>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-foreground/90 uppercase bg-muted/30">
            <tr>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className={`hover:bg-muted/20 transition-colors cursor-pointer ${user.is_deleted ? 'opacity-50' : ''}`}
                onClick={(e) => {
                  // Prevent opening modal if they clicked an action button
                  if ((e.target as HTMLElement).closest('button')) return;
                  setSelectedUserId(user.id);
                }}
              >
                <td className="px-6 py-4 font-medium">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                      : 'bg-muted text-foreground/90 border border-border/50'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.is_deleted ? (
                    <span className="text-xs font-medium text-destructive">Deleted</span>
                  ) : (
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${
                      user.is_active ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-foreground/90">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-right">
                  {!user.is_deleted && (
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                        title="Send Notification"
                        onClick={() => setNotificationUser({ id: user.id, email: user.email })}
                      >
                        <BellPlus className="h-4 w-4" />
                      </Button>

                      {user.is_active ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                          title="Deactivate User"
                          onClick={() => deactivate.mutate(user.id)}
                          disabled={deactivate.isPending}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                          title="Activate User"
                          onClick={() => activate.mutate(user.id)}
                          disabled={activate.isPending}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Delete User"
                        onClick={() => remove.mutate(user.id)}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-foreground/90">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border/50 flex items-center justify-between">
        <p className="text-sm text-foreground/90">
          Showing {users.length > 0 ? page * limit + 1 : 0} to {Math.min((page + 1) * limit, total)} of {total} users
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrev} 
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNext} 
            disabled={page >= maxPage}
          >
            Next
          </Button>
        </div>
      </div>

      <UserProfileModal 
        userId={selectedUserId} 
        onClose={() => setSelectedUserId(null)} 
      />
      
      {notificationUser && (
        <SendNotificationModal
          isOpen={!!notificationUser}
          onClose={() => setNotificationUser(null)}
          userId={notificationUser.id}
          userEmail={notificationUser.email}
        />
      )}
    </GlassCard>
  );
}
