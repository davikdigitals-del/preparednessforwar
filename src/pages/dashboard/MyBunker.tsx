import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StickyNote, ListChecks, Users, Plus, Edit, Trash2, Pin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MemberNote, PreparednessChecklist, EmergencyContact, ChecklistItem } from "@/types/memberPortal";

export default function MyBunker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [checklists, setChecklists] = useState<PreparednessChecklist[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [notesData, checklistsData, contactsData] = await Promise.all([
        supabase.from("member_notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("preparedness_checklists").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("emergency_contacts").select("*").eq("user_id", user.id).order("priority", { ascending: false }),
      ]);

      setNotes(notesData.data || []);
      setChecklists(checklistsData.data || []);
      setContacts(contactsData.data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    
    const { error } = await supabase.from("member_notes").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Note deleted successfully" });
      fetchAllData();
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    if (!confirm("Delete this checklist?")) return;
    
    const { error } = await supabase.from("preparedness_checklists").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Checklist deleted successfully" });
      fetchAllData();
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Contact deleted successfully" });
      fetchAllData();
    }
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your bunker...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">My Bunker</h1>
        <p className="text-muted-foreground">
          Your personal preparedness command center - notes, checklists, and emergency contacts
        </p>
      </div>

      <Tabs defaultValue="notes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notes">
            <StickyNote className="w-4 h-4 mr-2" />
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="checklists">
            <ListChecks className="w-4 h-4 mr-2" />
            Checklists ({checklists.length})
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="w-4 h-4 mr-2" />
            Contacts ({contacts.length})
          </TabsTrigger>
        </TabsList>

        {/* NOTES TAB */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">Note creation form would go here</p>
              </DialogContent>
            </Dialog>
          </div>

          {notes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <StickyNote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Notes Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start documenting your preparedness plans and observations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <Card key={note.id} className={note.is_pinned ? "border-2 border-yellow-400" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                      {note.is_pinned && <Pin className="w-4 h-4 text-yellow-600 flex-shrink-0" />}
                    </div>
                    {note.category && <Badge variant="secondary">{note.category}</Badge>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-4 mb-4">{note.content}</p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CHECKLISTS TAB */}
        <TabsContent value="checklists" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Checklist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Checklist</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">Checklist creation form would go here</p>
              </DialogContent>
            </Dialog>
          </div>

          {checklists.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ListChecks className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Checklists Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create checklists to track your preparedness tasks
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {checklists.map(checklist => {
                const items = checklist.items || [];
                const completed = items.filter((i: ChecklistItem) => i.completed).length;
                const progress = items.length > 0 ? (completed / items.length) * 100 : 0;

                return (
                  <Card key={checklist.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{checklist.title}</CardTitle>
                          {checklist.description && (
                            <p className="text-sm text-muted-foreground mt-1">{checklist.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteChecklist(checklist.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{completed} / {items.length} completed</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {items.slice(0, 5).map((item: ChecklistItem) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <Checkbox checked={item.completed} />
                            <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                        {items.length > 5 && (
                          <p className="text-xs text-muted-foreground">+ {items.length - 5} more items</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* CONTACTS TAB */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">Contact creation form would go here</p>
              </DialogContent>
            </Dialog>
          </div>

          {contacts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Emergency Contacts</h3>
                <p className="text-muted-foreground mb-6">
                  Add important contacts for emergency situations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map(contact => (
                <Card key={contact.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{contact.name}</CardTitle>
                        {contact.relationship && (
                          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(contact.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {contact.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span> {contact.phone}
                      </div>
                    )}
                    {contact.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span> {contact.email}
                      </div>
                    )}
                    {contact.address && (
                      <div>
                        <span className="text-muted-foreground">Address:</span> {contact.address}
                      </div>
                    )}
                    {contact.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="mt-1">{contact.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
