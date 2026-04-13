import * as React from "react";
import { Command as CommandIcon, Search } from "lucide-react";

import { componentNames } from "@/lib/component-names";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/studio-sidebar";
import { useNavigation } from "@/contexts/navigation-context";
import { getComponentIds } from "@/lib/component-registry";
import { documentationPages } from "@/lib/documentation";
import { Kbd } from "@/components/ui/kbd";

const navSections = [
  {
    title: "Tools",
    items: [
      { id: "playground", title: "Playground" },
      { id: "blocks", title: "Blocks" },
    ],
  },
  {
    title: "Documentation",
    items: Object.values(documentationPages).map((page) => ({
      id: page.id,
      title: page.title,
    })),
  },
  {
    title: "Components",
    items: getComponentIds().map((id) => ({
      id,
      title: componentNames[id] || id,
    })),
  },
];

export function SearchForm(props: React.ComponentProps<"form">) {
  const [open, setOpen] = React.useState(false);
  const { setActiveComponent } = useNavigation();
  const { isMobile, setOpenMobile } = useSidebar();
  const isMac = React.useMemo(
    () => navigator.platform.toUpperCase().includes("MAC"),
    []
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form {...props} onSubmit={(e) => e.preventDefault()}>
      <SidebarGroup className="px-0 py-0">
        <SidebarGroupContent>
          <InputGroup
            className="relative cursor-pointer bg-background"
            onClick={() => setOpen(true)}
          >
            <InputGroupAddon>
              <Search className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search..."
              readOnly
              className="cursor-pointer pr-14"
            />
            <Kbd className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5">
              {isMac ? <CommandIcon className="size-3" /> : "Ctrl "}
              K
            </Kbd>
          </InputGroup>
        </SidebarGroupContent>
      </SidebarGroup>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search components and docs..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {navSections.map((section) => (
              <CommandGroup key={section.title} heading={section.title}>
                {section.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.title}
                    onSelect={() => {
                      setActiveComponent(item.id);
                      setOpen(false);
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </form>
  );
}
