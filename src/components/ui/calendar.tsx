"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"


function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-0 shadow-lg rounded-2xl overflow-hidden border border-border/50", // Removed default p-3, added rounded-2xl and shadow
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full h-full", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4 pb-4", defaultClassNames.month), // added pb-4
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between p-4 z-10", // Positioned in the header
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground p-0 select-none", // White text
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground p-0 select-none", // White text
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-16 w-full bg-primary text-primary-foreground text-lg font-bold mb-2 pt-1", // Purple Header
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-16 gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none text-lg font-bold text-primary-foreground", // Larger white text
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse px-4", // Added padding x
        weekdays: cn("flex px-4 pt-2", defaultClassNames.weekdays), // Adjusted spacing
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-medium text-[0.8rem] select-none uppercase tracking-wide",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2 px-4", defaultClassNames.week), // Spacing
        week_number_header: cn(
          "select-none w-8",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          "first:rounded-l-full last:rounded-r-full", // Try fully rounded sides for range behavior if needed, or just standard
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-full bg-accent text-accent-foreground",
          defaultClassNames.range_start
        ),
        range_middle: cn("bg-accent/50 rounded-none text-accent-foreground", defaultClassNames.range_middle),
        range_end: cn("rounded-r-full bg-accent text-accent-foreground", defaultClassNames.range_end),
        today: cn(
          "bg-accent/20 text-primary font-bold rounded-full",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground opacity-50",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-30",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-5", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-5", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-5", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-8 items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        "data-[selected-single=true]:rounded-full data-[selected-single=true]:shadow-md", // Added shadow and rounded-full for single selection
        "data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50",
        "hover:bg-accent hover:text-accent-foreground font-normal text-sm", // Clean hover
        "rounded-full aspect-square size-full max-w-[40px] mx-auto", // Circular days
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
