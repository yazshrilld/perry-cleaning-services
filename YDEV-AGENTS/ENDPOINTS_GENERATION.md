Excellent, this is enough to design a solid backend foundation.

## Recommended Backend Modules
1. `auth` (admin, customer login/session)
2. `customers`
3. `workers`
4. `bookings`
5. `job_assignments`
6. `payments`
7. `notifications`
8. `dashboard_stats`

## Core Tables/Collections (Phase 1)
1. `users`
- `id`, `email`, `passwordHash`, `role` (`admin|customer|worker`), `status`, `lastLogin`, timestamps

2. `customers`
- `id`, `userId`, `firstName`, `lastName`, `phone`, `defaultAddressId?`

3. `workers`
- `id`, `userId?` (if workers log in), `firstName`, `lastName`, `phone`, `isActive`, `onboardingStatus`

4. `addresses`
- `id`, `customerId`, `line1`, `city`, `state`, `postalCode`, `lat`, `lng`

5. `bookings`
- `id`, `customerId`, `addressId`, `serviceType`, `scheduledAt`, `status`, `notes`, `isUrgent`, timestamps

6. `job_assignments`
- `id`, `bookingId`, `workerId`, `assignedByAdminId`, `assignedAt`, `status` (`assigned|accepted|in_progress|completed|cancelled`)

7. `payments`
- `id`, `bookingId`, `customerId`, `amount`, `currency`, `status` (`pending|paid|failed|refunded`), `paidAt`, `providerRef`

8. `admin_notifications`
- `id`, `type`, `bookingId?`, `title`, `message`, `isRead`, `createdAt`

## Booking Lifecycle (important for consistency)
`draft -> pending_assignment -> assigned -> in_progress -> completed`  
Extra states: `cancelled`, `no_show`

## What powers your 4 stat cards
1. `Bookings Today`: count `bookings` created today
2. `Revenue Today`: sum `payments.amount` where `status=paid` and `paidAt` is today
3. `Active Workers`: count `workers` where `isActive=true`
4. `Pending Orders`: count `bookings` where `status in (pending_assignment, assigned)` and not completed

## Next step to do now
Ask your backend AI to implement only this first endpoint:

`GET /dashboard/stats`

with those 4 numbers, using timezone `Africa/Lagos`.

If you want, next I’ll give you:
1. Exact SQL/Mongo schema definitions
2. Exact endpoint request/response contracts
3. Seed data script plan so your dashboard is testable immediately.
