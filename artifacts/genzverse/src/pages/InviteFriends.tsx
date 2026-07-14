import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, socialApi } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Mail, MessageCircle, Send, QrCode, Share2, RefreshCw, X } from "lucide-react";

export default function InviteFriends() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const inviteQuery = useQuery({
    queryKey: ["social", "inviteDashboard"],
    queryFn: () => socialApi.getInviteDashboard(),
  });

  const inviteMutation = useMutation({
    mutationFn: (targetEmail: string) => socialApi.inviteByEmail(targetEmail),
    onSuccess: async (data) => {
      setEmail("");
      await queryClient.invalidateQueries({ queryKey: ["social", "inviteDashboard"] });
      toast({
        title: data.emailSent ? "Invite sent" : "Invite saved",
        description: data.previewUrl
          ? `${data.message} Preview: ${data.previewUrl}`
          : data.message,
      });
    },
    onError: (err) => {
      toast({
        title: "Invite failed",
        description: err instanceof ApiError ? err.message : "Could not send invite",
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => socialApi.resendInvite(id),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["social", "inviteDashboard"] });
      toast({ title: "Resent", description: data.message });
    },
    onError: (err) => {
      toast({
        title: "Resend failed",
        description: err instanceof ApiError ? err.message : "Could not resend",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => socialApi.cancelInvite(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["social", "inviteDashboard"] });
      toast({ title: "Cancelled", description: "Invitation cancelled" });
    },
    onError: (err) => {
      toast({
        title: "Cancel failed",
        description: err instanceof ApiError ? err.message : "Could not cancel",
        variant: "destructive",
      });
    },
  });

  const inviteLink = inviteQuery.data?.inviteLink ?? "";
  const encodedText = encodeURIComponent(`Join me on GenZVerse: ${inviteLink}`);
  const qrUrl = useMemo(
    () => (inviteLink ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteLink)}` : ""),
    [inviteLink],
  );
  const shareTargets = {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("Join me on GenZVerse")}`,
    sms: `sms:?body=${encodedText}`,
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-foreground uppercase">Invite Friends</h1>
        <p className="text-muted-foreground mt-2">Grow your social graph with referral links and direct invites.</p>
      </div>

      <Card className="bg-card border-border p-4 space-y-4">
        <p className="text-sm text-muted-foreground">Your unique invite link</p>
        <div className="flex gap-2">
          <Input readOnly value={inviteLink} className="bg-background border-border" />
          <Button
            className="bg-lime text-black"
            onClick={async () => {
              await navigator.clipboard.writeText(inviteLink);
              toast({ title: "Copied", description: "Invite link copied" });
            }}
          >
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <a href={shareTargets.whatsapp} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full"><MessageCircle className="h-4 w-4 mr-1" /> WhatsApp</Button></a>
          <a href={shareTargets.telegram} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full"><Send className="h-4 w-4 mr-1" /> Telegram</Button></a>
          <a href={shareTargets.sms}><Button variant="outline" className="w-full">SMS</Button></a>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (!qrUrl) return;
              window.open(qrUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <QrCode className="h-4 w-4 mr-1" /> QR
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              if (navigator.share) {
                await navigator.share({ url: inviteLink, title: "Join me on GenZVerse" });
              } else {
                await navigator.clipboard.writeText(inviteLink);
                toast({ title: "Copied", description: "Share link copied" });
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
        {qrUrl && (
          <div className="pt-2">
            <img src={qrUrl} alt="Invite QR code" className="h-40 w-40 rounded-xl border border-border bg-white p-2" />
          </div>
        )}
      </Card>

      <Card className="bg-card border-border p-4 space-y-3">
        <h2 className="font-bold">Invite via email</h2>
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            className="bg-background border-border"
          />
          <Button
            className="bg-lime text-black"
            disabled={inviteMutation.isPending || !isValidEmail}
            onClick={() => inviteMutation.mutate(email.trim().toLowerCase())}
          >
            <Mail className="h-4 w-4 mr-1" /> {inviteMutation.isPending ? "Sending..." : "Invite"}
          </Button>
        </div>
        {email && !isValidEmail && <p className="text-xs text-destructive">Enter a valid email address</p>}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border p-4">
          <h3 className="font-bold mb-3">Invitation Statistics</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/40 border border-border">Total Sent: {inviteQuery.data?.stats.totalSent ?? 0}</div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border">Pending: {inviteQuery.data?.stats.pending ?? 0}</div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border">Successful: {inviteQuery.data?.stats.accepted ?? 0}</div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border">Referral XP: {inviteQuery.data?.stats.referralXp ?? 0}</div>
          </div>
        </Card>

        <Card className="bg-card border-border p-4">
          <h3 className="font-bold mb-3">Invitation History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(inviteQuery.data?.history ?? []).map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm">{item.email}</p>
                  <p className="text-xs text-muted-foreground">{item.status} · {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                {item.status === "PENDING" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" disabled={resendMutation.isPending} onClick={() => resendMutation.mutate(item.id)}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate(item.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {(inviteQuery.data?.history ?? []).length === 0 && <p className="text-sm text-muted-foreground">No invitations yet.</p>}
          </div>
        </Card>
      </div>

      <Card className="bg-card border-border p-4">
        <h3 className="font-bold mb-3">Invited users</h3>
        <div className="space-y-2">
          {(inviteQuery.data?.acceptedUsers ?? []).map((u) => (
            <div key={u.id} className="flex items-center justify-between text-sm border border-border rounded-lg p-3">
              <span>{u.displayName || u.username || u.id}</span>
              <span className="text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
          {(inviteQuery.data?.acceptedUsers ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No accepted invites yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
