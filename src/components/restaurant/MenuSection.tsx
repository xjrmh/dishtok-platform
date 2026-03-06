"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MenuItemCard } from "./MenuItem";
import { MenuItemModal } from "./MenuItemModal";
import { MenuTab, MenuItem } from "@/types";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

interface MenuSectionProps {
  menu: MenuTab[];
  title?: string;
  description?: string;
}

export function MenuSection({
  menu,
  title = "Our Menu",
  description = "Authentic Cuban & Latin flavors, crafted with passion",
}: MenuSectionProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  return (
    <section id="menu" className="bg-theme-surface py-16">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection className="text-center mb-10">
          <h2 className="mb-3 font-serif text-4xl font-bold text-theme-ink">
            {title}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </AnimatedSection>

        <Tabs defaultValue={menu[0]?.id} className="w-full">
          <TabsList className="mb-8 flex w-full justify-start overflow-x-auto rounded-xl bg-theme-panel p-1 flex-nowrap">
            {menu.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-lg px-6 py-2.5 text-sm font-medium data-[state=active]:bg-theme-primary data-[state=active]:text-theme-primary-foreground"
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {menu.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {tab.categories.map((category) => (
                  <div key={category.id} className="mb-12">
                    <h3 className="mb-6 flex items-center gap-3 text-2xl font-serif font-bold text-theme-ink">
                      <div className="h-0.5 w-8 bg-theme-primary" />
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onSelect={setSelectedItem}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <MenuItemModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}
