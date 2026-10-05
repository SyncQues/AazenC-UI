# AazenC UI Component Catalog

Build list for this library. ✅ marks what already ships: 56 components, all of
them in `packages/ui/src`, published through `apps/registry/registry.json`, and
openable at `/components/<slug>` in the playground. Everything unmarked is still
to build. Add each one under `packages/ui/src`.

The slug in the backticks is the one the registry, the playground route, and
`npx aazenc-ui add <slug>` all share. One slug can mark more than one line,
because one component covers more than one entry here — `input` covers every
native field type, and `dialog` covers both modal and alert. Count progress by
slug, not by line.

## 1. Foundation

-   Button ✅ (`button`)
-   Icon Button
-   Link
-   Typography
-   Typeset ✅ (`typeset`) — the stylesheet in `packages/tokens/src/typeset.css`
    is separate from this line. `Typography` is still the React primitive; Typeset
    is the CSS system that styles plain HTML and rendered markdown. They are
    complements, not the same component.
-   Divider
-   Badge ✅ (`badge`)
-   Avatar ✅ (`avatar`)
-   Avatar Group
-   Breadcrumb ✅ (`breadcrumb`)
-   Separator ✅ (`separator`)
-   Skeleton ✅ (`skeleton`)
-   Spinner ✅ (`spinner`)
-   Progress ✅ (`progress`)
-   Circular Progress
-   Chip
-   Keyboard Key (Kbd)
-   Scroll Area
-   Aspect Ratio
-   Container
-   Stack
-   Grid
-   Flex
-   Box
-   Center
-   Spacer

## 2. Form Components

-   Label ✅ (`label`)
-   Input ✅ (`input`)
-   Textarea ✅ (`textarea`)
-   Password Input ✅ (`input`)
-   Search Input ✅ (`input`)
-   OTP Input
-   Number Input ✅ (`input`)
-   Currency Input
-   Phone Input
-   URL Input ✅ (`input`)
-   Email Input ✅ (`input`)
-   Date Picker ✅ (`date-picker`)
-   Time Picker ✅ (`time-picker`)
-   Date Time Picker ✅ (`date-time-picker`)
-   Month Picker ✅ (`month-picker`)
-   Range Picker ✅ (`date-picker`)
-   Checkbox ✅ (`checkbox`)
-   Radio Group
-   Switch ✅ (`switch`)
-   Toggle ✅ (`toggle`)
-   Toggle Group ✅ (`toggle-group`)
-   Slider ✅ (`slider`)
-   Select ✅ (`select`)
-   Multi Select ✅ (`select`)
-   Combobox
-   Autocomplete
-   Command Palette ✅ (`command`)
-   File Upload ✅ (`file-upload`)
-   Image Upload
-   Drag & Drop Upload ✅ (via `file-upload`)
-   Color Picker
-   Rating
-   Pin Input
-   Signature Pad
-   Rich Text Editor
-   Markdown Editor
-   JSON Editor

## 3. Navigation

-   Navbar ✅ (`navbar`)
-   Sidebar
-   Navigation Menu
-   Mega Menu
-   Dropdown ✅ (`dropdown-menu`)
-   Context Menu ✅ (`context-menu`)
-   Pagination
-   Tabs ✅ (`tabs`)
-   Segmented Control ✅ (`segmented-control`)
-   Stepper
-   Dock
-   Bottom Navigation
-   Command Menu ✅ (`command`)
-   Floating Menu
-   Accordion ✅ (`accordion`)
-   Collapsible ✅ (`collapsible`)
-   Tree View

## 4. Overlay Components

-   Modal ✅ (`dialog`)
-   Drawer ✅ (`drawer`)
-   Sheet ✅ (`sheet`)
-   Popover ✅ (`popover`)
-   Tooltip ✅ (`tooltip`)
-   Hover Card ✅ (`hover-card`)
-   Alert Dialog ✅ (`dialog`, via `kind="alert"`)
-   Confirmation Dialog
-   Toast ✅ (`toast`)
-   Notification Center
-   Tour
-   Spotlight Search
-   Fullscreen Dialog

## 5. Data Display

-   Card ✅ (`card`)
-   Table ✅ (`table`)
-   Data Grid
-   Virtual Table
-   Timeline
-   Calendar ✅ (`calendar`)
-   Kanban
-   List
-   Description List
-   Empty State ✅ (`empty`)
-   Statistic Card
-   Metric Card ✅ (`metric-card`)
-   Pricing Card
-   Feature Card
-   Activity Feed

## 6. AI Components

-   AI Chat
-   Chat Bubble
-   AI Message
-   User Message
-   Prompt Input
-   Streaming Text
-   Typing Indicator
-   AI Loader
-   Code Block
-   Markdown Renderer ✅ (`markdown-viewer`)
-   Reasoning Block
-   Citation Card
-   Thinking Animation
-   Token Counter
-   Prompt Suggestions
-   AI File Upload
-   AI Image Preview
-   Voice Recorder
-   Audio Player
-   Conversation Sidebar
-   Agent Card
-   Tool Call Viewer
-   MCP Server Card
-   AI Model Selector
-   Conversation Tree

## 7. Dashboard Components

-   Dashboard Header
-   Dashboard Sidebar
-   Analytics Cards
-   KPI Cards
-   Charts Wrapper
-   Activity Timeline
-   Recent Activity
-   User Table
-   Revenue Card
-   Team Card
-   Project Card
-   Calendar Widget
-   Weather Widget
-   Notes Widget

## 8. Feedback

-   Alert ✅ (`alert`)
-   Banner
-   Callout
-   Success Message
-   Error Message
-   Warning Box
-   Loading Screen
-   Empty Screen
-   Retry View
-   Offline Banner

## 9. Layout

-   Split Pane
-   Resizable Panel ✅ (`resizable`)
-   Masonry Grid
-   Bento Grid
-   Hero Section
-   Feature Grid
-   Section
-   App Shell
-   Workspace Layout
-   Auth Layout
-   Dashboard Layout

## 10. Mobile Components

-   Swipe Card
-   Swipe Action
-   Bottom Sheet
-   Pull To Refresh
-   Floating Action Button
-   Mobile Navbar
-   Mobile Sidebar
-   Carousel ✅ (`carousel`)

## 11. Charts

-   Chart Container ✅ (`chart-container`)
-   Area Chart ✅ (`area-chart`)
-   Bar Chart ✅ (`bar-chart`)
-   Line Chart ✅ (`line-chart`)
-   Pie Chart ✅ (`pie-chart`)
-   Donut Chart
-   Radar Chart
-   Heat Map ✅ (`heat-map`)
-   Tree Map
-   Sankey Diagram
-   Funnel Chart
-   Gauge
-   Sparkline

The six chart components share one engine (`chart-utils`) and one set of
primitives (`chart-primitives`) rather than wrapping a charting library, so a
chart is themed by the same tokens as the rest of the product, animates on the
compositor, and is keyboard and screen-reader readable. Donut is a variant of
Pie, not a separate component.

## 12. Tables

-   Simple Table
-   Server Table
-   Infinite Table
-   Tree Table
-   Editable Table
-   Expandable Table
-   Grouped Table
-   Virtualized Table

## 13. Developer Components

-   Copy Button
-   Theme Toggle ✅ (`theme-selector`)
-   Code Viewer ✅ (`code-block`)
-   API Preview
-   Props Table
-   Playground
-   CLI Install Block
-   Terminal Block
-   JSON Viewer

## 14. File Components

-   File Card
-   Folder Card
-   File Explorer
-   Image Preview
-   PDF Viewer ✅ (`pdf-viewer`)
-   Audio Player
-   Video Player
-   Image Editor
-   Drag Upload Zone ✅ (via `file-upload`)

## 15. Authentication

-   Login Form
-   Register Form
-   Forgot Password
-   Reset Password
-   Verify Email
-   Two Factor Authentication
-   Session List
-   OAuth Buttons

## 16. E-commerce

-   Product Card
-   Shopping Cart
-   Quantity Selector
-   Checkout Steps
-   Order Timeline
-   Address Card

## 17. Social

-   User Card
-   Post Card
-   Comment Thread
-   Reaction Bar
-   Followers List
-   Profile Header
-   Stories
-   Chat List

## 18. Productivity

-   Todo List
-   Task Card
-   Task Board
-   Kanban Board
-   Calendar Planner
-   Reminder Card
-   Notes Editor
-   Whiteboard
-   Workspace Switcher
-   Team Selector
-   Project Timeline
-   Gantt Chart

## 19. Glass UI Components

-   Glass Button
-   Glass Card
-   Glass Sidebar
-   Glass Navbar
-   Glass Modal
-   Glass Input
-   Glass Avatar
-   Glass Badge
-   Glass Dropdown
-   Glass Dock
-   Glass Tabs

## 20. Premium Components

-   Visual Form Builder
-   Workflow Builder
-   AI Chat Builder
-   Query Builder
-   JSON Schema Form
-   Visual SQL Builder
-   Resume Builder
-   Email Builder
-   Kanban Builder
-   Dashboard Builder
-   Flow Editor
-   Mind Map
-   Organization Chart
-   Visual Rule Engine
-   Prompt Builder
-   Timeline Editor
