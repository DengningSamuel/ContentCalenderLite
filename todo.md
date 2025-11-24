# Content Calendar Lite - Project TODO

## Core Features

### Database & Schema
- [x] Create content_posts table (id, userId, title, content, platforms, scheduledAt, status, createdAt)
- [x] Create content_templates table (id, userId, name, content, category, createdAt)
- [x] Create subscriptions table (id, userId, plan, status, currentPeriodStart, currentPeriodEnd, createdAt)
- [x] Create payment_requests table (for manual payment processing)
- [x] Create user_teams table (id, userId, teamName, createdAt)
- [x] Create team_members table (id, teamId, userId, role, createdAt)

### Authentication & User Management
- [x] Verify OAuth login flow works with Manus Auth
- [ ] Create user profile page (view/edit name, email, subscription status)
- [x] Implement logout functionality
- [x] Add role-based access control (admin/user)

### Content Calendar Features
- [x] Build calendar view component (month view)
- [x] Create post creation modal (title, content, platform selection, schedule date)
- [x] Implement post list view
- [ ] Add post editing functionality
- [x] Add post deletion with confirmation
- [x] Implement post status tracking (draft, scheduled, published)
- [x] Add platform multi-select (Instagram, Facebook, LinkedIn, Twitter)

### Content Templates
- [x] Create template library page
- [x] Build template creation form
- [x] Implement template usage (copy to clipboard)
- [ ] Add template categories/tags
- [x] Template preview functionality

### Subscription & Billing (Manual Payment System)
- [x] Create pricing page with three tiers (Free, Pro, Business)
- [x] Build subscription management dashboard
- [x] Implement manual payment request system
- [x] Add payment proof submission form
- [x] Create admin approval workflow for payments
- [ ] Add subscription upgrade/downgrade flow
- [ ] Add usage limits per plan (posts/month, templates, team members)
- [ ] Add email notifications for payment status

### Team Collaboration
- [ ] Create team management page
- [ ] Implement invite team members functionality
- [ ] Add role-based permissions (admin, editor, viewer)
- [ ] Build team member management UI

### Analytics & Dashboard
- [x] Create dashboard home page (overview stats)
- [x] Display total posts created, scheduled, published
- [x] Show upcoming scheduled posts
- [ ] Add basic analytics (posts per platform)

### UI/UX
- [x] Design and implement navigation structure
- [x] Create responsive layout (mobile-first)
- [x] Build consistent component library
- [x] Add loading states and error handling
- [x] Implement empty states for all views
- [x] Add toast notifications for user feedback
- [x] Create landing page with feature highlights

### Deployment & Launch
- [ ] Set up environment variables
- [ ] Create checkpoint before deployment
- [ ] Deploy to production
- [ ] Set up custom domain (if needed)
- [ ] Create user documentation/onboarding

## Bugs & Issues
(None reported yet)

## Notes
- Target: 50-100 paying customers at $19-49/month = $500-4900 MRR
- MVP focus: Core calendar + templates + basic subscription with manual payments
- Manual payment system implemented for regions without Stripe access
- Bank transfer details configured in Pricing page
- Admin approval workflow for payment verification
- Future enhancements: AI content suggestions, advanced analytics, social media posting integration, automated payment processing

## Completed Features Summary
✅ Full-stack application with React + Express + tRPC + MySQL
✅ User authentication with Manus OAuth
✅ Content calendar with drag-and-drop interface
✅ Content templates library
✅ Manual payment system with bank transfer support
✅ Admin dashboard for payment verification
✅ Responsive UI with Tailwind CSS
✅ Database schema with 7 tables
✅ tRPC procedures for all features
