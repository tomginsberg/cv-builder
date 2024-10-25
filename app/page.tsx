"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";

type Entry = {
  title: string;
  date: string;
  institution: string;
  notes: string;
  [key: string]: string;
};

type Section = {
  name: string;
  entries: Entry[];
};

type CV = {
  name: string;
  email: string;
  address: string;
  phone: string;
  sections: Section[];
};

const emptyCV: CV = {
  name: "",
  email: "",
  address: "",
  phone: "",
  sections: [
    { name: "Education", entries: [] },
    { name: "Work Experience", entries: [] },
    { name: "Skills", entries: [] },
  ],
};

export default function Home() {
  const [cv, setCv] = useState<CV | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [entryToRemove, setEntryToRemove] = useState<{
    sectionIndex: number;
    entryIndex: number;
  } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<boolean[]>([]);
  const [removeSectionDialogOpen, setRemoveSectionDialogOpen] = useState(false);
  const [sectionToRemove, setSectionToRemove] = useState<number | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const parsedCV = JSON.parse(content);
          setCv(parsedCV);
          setCollapsedSections(new Array(parsedCV.sections.length).fill(true));
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Error parsing JSON file. Please ensure it's a valid JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  const createNewCV = () => {
    setCv(emptyCV);
    setCollapsedSections(new Array(emptyCV.sections.length).fill(true));
  };

  const handlePersonalInfoChange = (field: keyof CV, value: string) => {
    if (cv) {
      setCv({ ...cv, [field]: value });
    }
  };

  const handleEntryChange = (
    sectionIndex: number,
    entryIndex: number,
    field: string,
    value: string
  ) => {
    if (cv) {
      const newSections = [...cv.sections];
      newSections[sectionIndex].entries[entryIndex][field] = value;
      setCv({ ...cv, sections: newSections });
    }
  };

  const addEntry = (sectionIndex: number) => {
    if (cv) {
      const newSections = [...cv.sections];
      newSections[sectionIndex].entries.push({
        title: "",
        date: "",
        institution: "",
        notes: "",
      });
      setCv({ ...cv, sections: newSections });
    }
  };

  const confirmRemoveEntry = (sectionIndex: number, entryIndex: number) => {
    setEntryToRemove({ sectionIndex, entryIndex });
    setRemoveDialogOpen(true);
  };

  const removeEntry = () => {
    if (cv && entryToRemove) {
      const { sectionIndex, entryIndex } = entryToRemove;
      const newSections = [...cv.sections];
      newSections[sectionIndex].entries.splice(entryIndex, 1);
      setCv({ ...cv, sections: newSections });
      setRemoveDialogOpen(false);
      setEntryToRemove(null);
    }
  };

  const generateCV = () => {
    if (cv) {
      const jsonString = JSON.stringify(cv, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "updated_cv.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const toggleSection = (index: number) => {
    setCollapsedSections((prev) => {
      const newCollapsedSections = [...prev];
      newCollapsedSections[index] = !newCollapsedSections[index];
      return newCollapsedSections;
    });
  };

  const handleSectionNameChange = (index: number, newName: string) => {
    if (cv) {
      const newSections = [...cv.sections];
      newSections[index].name = newName;
      setCv({ ...cv, sections: newSections });
    }
  };

  const addSection = () => {
    if (cv) {
      const newSections = [
        ...cv.sections,
        { name: "New Section", entries: [] },
      ];
      setCv({ ...cv, sections: newSections });
      setCollapsedSections([...collapsedSections, true]);
    }
  };

  const confirmRemoveSection = (index: number) => {
    setSectionToRemove(index);
    setRemoveSectionDialogOpen(true);
  };

  const removeSection = () => {
    if (cv && sectionToRemove !== null) {
      const newSections = cv.sections.filter(
        (_, index) => index !== sectionToRemove
      );
      setCv({ ...cv, sections: newSections });
      setCollapsedSections(
        collapsedSections.filter((_, index) => index !== sectionToRemove)
      );
      setRemoveSectionDialogOpen(false);
      setSectionToRemove(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CV Editor</h1>
      <div className="flex gap-4 mb-4">
        <Input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          ref={fileInputRef}
        />
        <Button onClick={createNewCV}>Create New CV</Button>
      </div>
      {cv && (
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Name"
                  value={cv.name}
                  onChange={(e) =>
                    handlePersonalInfoChange("name", e.target.value)
                  }
                />
                <Input
                  placeholder="Email"
                  value={cv.email}
                  onChange={(e) =>
                    handlePersonalInfoChange("email", e.target.value)
                  }
                />
                <Input
                  placeholder="Address"
                  value={cv.address}
                  onChange={(e) =>
                    handlePersonalInfoChange("address", e.target.value)
                  }
                />
                <Input
                  placeholder="Phone"
                  value={cv.phone}
                  onChange={(e) =>
                    handlePersonalInfoChange("phone", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
          {cv.sections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="mb-4">
              <CardHeader className={cn("sticky top-0 z-10 flex flex-row items-center justify-between rounded-t-xl transition-all ease-linear",
                collapsedSections[sectionIndex] ? "rounded-b-xl bg-background" : "mb-2 bg-accent rounded-b-none border-b"
              )}>
                <Input
                  value={section.name}
                  onChange={(e) =>
                    handleSectionNameChange(sectionIndex, e.target.value)
                  }
                  className="font-bold text-lg w-full"
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(sectionIndex)}
                    aria-label={
                      collapsedSections[sectionIndex]
                        ? "Expand section"
                        : "Collapse section"
                    }
                  >
                    {collapsedSections[sectionIndex] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmRemoveSection(sectionIndex)}
                    aria-label="Remove section"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {!collapsedSections[sectionIndex] && (
                <CardContent>
                  {section.entries.map((entry, entryIndex) => (
                    <div key={entryIndex} className="mb-4 p-4 border rounded">
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <Input
                          placeholder="Title"
                          value={entry.title}
                          onChange={(e) =>
                            handleEntryChange(
                              sectionIndex,
                              entryIndex,
                              "title",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          placeholder="Date"
                          value={entry.date}
                          onChange={(e) =>
                            handleEntryChange(
                              sectionIndex,
                              entryIndex,
                              "date",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          placeholder="Institution"
                          value={entry.institution}
                          onChange={(e) =>
                            handleEntryChange(
                              sectionIndex,
                              entryIndex,
                              "institution",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <Textarea
                        placeholder="Notes"
                        value={entry.notes}
                        onChange={(e) =>
                          handleEntryChange(
                            sectionIndex,
                            entryIndex,
                            "notes",
                            e.target.value
                          )
                        }
                        className="mb-2"
                      />
                      <Button
                        variant="destructive"
                        onClick={() =>
                          confirmRemoveEntry(sectionIndex, entryIndex)
                        }
                      >
                        Remove Entry
                      </Button>
                    </div>
                  ))}
                  <Button onClick={() => addEntry(sectionIndex)}>
                    Add Entry
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
          <div className="flex justify-between mt-4">
            <Button onClick={addSection}>
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
            <Button onClick={generateCV}>Generate CV</Button>
          </div>
        </div>
      )}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this entry? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={removeEntry}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={removeSectionDialogOpen}
        onOpenChange={setRemoveSectionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Section Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this entire section? This action
              cannot be undone and will delete all entries in this section.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveSectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={removeSection}>
              Remove Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
