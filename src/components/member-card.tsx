"use client";

import type { Member } from "@/lib/types";
import { useAppContext } from "@/contexts/app-context";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, VenetianMask, Tractor, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: Member;
  isActive: boolean;
}

export function MemberCard({ member, isActive }: MemberCardProps) {
  const { updateMemberPreferences, deleteMember } = useAppContext();

  const handlePreferenceChange = (key: keyof Member['preferences'], value: boolean) => {
    updateMemberPreferences(member.id, { ...member.preferences, [key]: value });
  };

  return (
    <Card className={cn(isActive && "border-primary ring-2 ring-primary")}>
      <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-grow">
          <h3 className="font-semibold text-lg">{member.name}</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
            <div className="flex items-center space-x-2">
                <Tractor className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={`agriculture-${member.id}`}>Agriculture</Label>
                <Switch
                    id={`agriculture-${member.id}`}
                    checked={member.preferences.agriculture}
                    onCheckedChange={(checked) => handlePreferenceChange('agriculture', checked)}
                />
            </div>
            <div className="flex items-center space-x-2">
                <VenetianMask className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={`dress-${member.id}`}>Dress</Label>
                <Switch
                    id={`dress-${member.id}`}
                    checked={member.preferences.dress}
                    onCheckedChange={(checked) => handlePreferenceChange('dress', checked)}
                />
            </div>
            <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={`transport-${member.id}`}>Transport</Label>
                <Switch
                    id={`transport-${member.id}`}
                    checked={member.preferences.transport}
                    onCheckedChange={(checked) => handlePreferenceChange('transport', checked)}
                />
            </div>
          </div>
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={(e) => {
                e.stopPropagation();
                deleteMember(member.id);
            }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
