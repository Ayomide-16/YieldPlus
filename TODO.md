# YieldPlus.ai - NBS Data Integration Implementation TODO

## ✅ Phase 1: Data Structure & UI Updates
- [x] Fetch and analyze NBS website structure
- [ ] Update worldLocations.ts with ALL 36 Nigerian states + FCT and their LGAs
- [ ] Create database migration for data_sync_history table
- [ ] Create database migration for admin role setup

## ✅ Phase 2: Edge Function Development
- [ ] Create `fetch-nbs-data` edge function:
  - Scrape/detect download link from NBS website
  - Download file (Google Drive, CSV, Excel, ZIP)
  - Parse and transform to standard schema
  - Validate and clean data
  - Deduplicate records
  - Bulk insert to market_prices table
  - Log sync history
  
## ✅ Phase 3: Admin Panel UI
- [ ] Create AdminDashboard page component
- [ ] Add data sync control panel:
  - Manual trigger button
  - Last sync timestamp display
  - Record count statistics
  - Dataset source link
  - Sync progress indicator
  - Error log viewer
  
## ✅ Phase 4: Scheduled Automation
- [ ] Set up pg_cron for weekly automatic sync
- [ ] Create cron job SQL script
- [ ] Add monitoring/alerting for failed syncs

## ✅ Phase 5: Error Handling & Fallback
- [ ] Enhance all edge functions with comprehensive error handling
- [ ] Implement fallback to previous analysis on failure
- [ ] Add retry logic with exponential backoff
- [ ] Ensure no hard failures - always return results

## ✅ Phase 6: Testing & Validation
- [ ] Test manual sync flow
- [ ] Test automatic cron sync
- [ ] Test error scenarios and fallbacks
- [ ] Validate data deduplication
- [ ] Verify UI updates correctly

## Critical Bug Fix Priority
- [ ] Fix "Analysis failed - edge function returned non-2xx" error
- [ ] Ensure system always produces valid results even on errors
- [ ] Implement graceful degradation
