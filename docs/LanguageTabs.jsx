import React from 'react';
import Tabs from "@theme/Tabs";

/**
 * A simple abstraction component to simplify switching between programming languages using
 * Docusaurus' Tabs component
 */
export default function LanguageTabs({ children }) {
  return (
    <Tabs
      groupId="language"
      defaultValue="ts"
      values={[
        { label: "TypeScript", value: "ts" },
        { label: "JavaScript", value: "js" },
      ]}
    >
      {children}
    </Tabs>
  );
}
