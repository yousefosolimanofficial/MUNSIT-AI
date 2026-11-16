"use client";

import { useRef, useState } from "react";

import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { Menu, MenuItem, MenuItemRadio, MenuRadioGroup, MenuSeparator } from "@/shared/ui/Menu";
import { Popover } from "@/shared/ui/Popover";
import { Sheet } from "@/shared/ui/Sheet";

/*
 * TEMPORARY gallery demo for Popover/Menu V1 (contract
 * docs/phases/phase-03-popover-menu-contract.md). Dev-only; part of /dev/components.
 * Copy: More Options `2261:1500`, Filter Menu `Kind=Sort` `2261:1429`, User Menu `2236:813`,
 * Notification Dropdown `2236:784` (Figma). The account header and notification rows are demo
 * content (owned by the Phase 05 shell); rename and delete render without icons (D-PM9).
 */

const COPY = {
  ar: {
    options: "خيارات المحاضرة",
    open: "فتح المحاضرة",
    rename: "إعادة تسمية",
    favorite: "إضافة إلى المفضلة",
    delete: "حذف",
    sort: "الترتيب",
    newest: "الأحدث أولًا",
    oldest: "الأقدم أولًا",
    byName: "الاسم",
    account: "الحساب",
    name: "أحمد محمود",
    role: "طالب — هندسة حاسبات",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    notifications: "الإشعارات",
    viewAll: "عرض كل الإشعارات",
    deleteTitle: "حذف المحاضرة؟",
    deleteText: "هل أنت متأكد إنك عايز تحذف المحاضرة دي؟",
    cancel: "إلغاء",
    close: "إغلاق",
  },
  en: {
    options: "Lecture options",
    open: "Open lecture",
    rename: "Rename",
    favorite: "Add to favorites",
    delete: "Delete",
    sort: "Sort",
    newest: "Newest first",
    oldest: "Oldest first",
    byName: "Name",
    account: "Account",
    name: "Ahmed Mahmoud",
    role: "Student — Computer Engineering",
    profile: "Profile",
    settings: "Settings",
    logout: "Log out",
    notifications: "Notifications",
    viewAll: "View all notifications",
    deleteTitle: "Delete the lecture?",
    deleteText: "Are you sure you want to delete this lecture?",
    cancel: "Cancel",
    close: "Close",
  },
} as const;

type Copy = (typeof COPY)[keyof typeof COPY];

function ContextMenu({
  copy,
  testId,
  onDelete,
}: {
  copy: Copy;
  testId: string;
  onDelete?: () => void;
}) {
  return (
    <Menu
      label={copy.options}
      trigger={(props) => (
        <Button data-testid={testId} variant="secondary" {...props}>
          {copy.options}
        </Button>
      )}
    >
      <MenuItem icon="play">{copy.open}</MenuItem>
      <MenuItem>{copy.rename}</MenuItem>
      <MenuItem icon="star">{copy.favorite}</MenuItem>
      <MenuSeparator />
      <MenuItem tone="danger" onSelect={onDelete}>
        {copy.delete}
      </MenuItem>
    </Menu>
  );
}

export function PopoverMenuDemo({ locale }: { locale: "ar" | "en" }) {
  const copy = COPY[locale];
  const [sort, setSort] = useState("newest");
  const [confirm, setConfirm] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-wrap items-start gap-md">
      <ContextMenu copy={copy} testId="menu-trigger-context" onDelete={() => setConfirm(true)} />

      <Menu
        label={copy.sort}
        trigger={(props) => (
          <Button data-testid="menu-trigger-sort" variant="secondary" {...props}>
            {copy.sort}: <output data-testid="menu-sort-value">{sort}</output>
          </Button>
        )}
      >
        <MenuRadioGroup value={sort} onValueChange={setSort} label={copy.sort}>
          <MenuItemRadio value="newest">{copy.newest}</MenuItemRadio>
          <MenuItemRadio value="oldest">{copy.oldest}</MenuItemRadio>
          <MenuItemRadio value="name">{copy.byName}</MenuItemRadio>
        </MenuRadioGroup>
      </Menu>

      <Menu
        variant="account"
        label={copy.account}
        header={
          <div className="flex flex-col px-[10px] py-[10px]" data-testid="menu-account-header">
            <span className="text-dashboard-card-title">{copy.name}</span>
            <span className="text-dashboard-caption text-text-secondary">{copy.role}</span>
          </div>
        }
        trigger={(props) => (
          <Button data-testid="menu-trigger-account" variant="secondary" {...props}>
            {copy.account}
          </Button>
        )}
      >
        <MenuItem icon="user">{copy.profile}</MenuItem>
        <MenuItem icon="settings">{copy.settings}</MenuItem>
        <MenuSeparator />
        <MenuItem icon="logout" tone="danger">
          {copy.logout}
        </MenuItem>
      </Menu>

      <Popover
        label={copy.notifications}
        trigger={(props) => (
          <Button data-testid="popover-trigger" variant="secondary" {...props}>
            {copy.notifications}
          </Button>
        )}
      >
        <h3 className="text-dashboard-card-title">{copy.notifications}</h3>
        <p className="text-dashboard-body text-text-secondary" data-testid="popover-body">
          {copy.deleteText}
        </p>
        <Button variant="secondary">{copy.viewAll}</Button>
      </Popover>

      <Button data-testid="menu-open-dialog" variant="secondary" onClick={() => setDialog(true)}>
        Menu inside Dialog
      </Button>
      <Button data-testid="menu-open-sheet" variant="secondary" onClick={() => setSheet(true)}>
        Menu inside Sheet
      </Button>

      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        role="alertdialog"
        width={420}
        icon="alert"
        tone="danger"
        title={copy.deleteTitle}
        description={copy.deleteText}
        initialFocusRef={cancelRef}
        actions={
          <>
            <Button onClick={() => setConfirm(false)}>{copy.delete}</Button>
            <Button
              ref={cancelRef}
              data-testid="menu-confirm-cancel"
              variant="secondary"
              onClick={() => setConfirm(false)}
            >
              {copy.cancel}
            </Button>
          </>
        }
      />

      <Dialog open={dialog} onOpenChange={setDialog} title={copy.options} closeLabel={copy.close}>
        <ContextMenu copy={copy} testId="menu-trigger-in-dialog" />
      </Dialog>

      <Sheet open={sheet} onOpenChange={setSheet} title={copy.options} closeLabel={copy.close}>
        <ContextMenu copy={copy} testId="menu-trigger-in-sheet" />
      </Sheet>
    </div>
  );
}
