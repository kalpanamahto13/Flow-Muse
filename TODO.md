# TODO: Add Predicted Periods Toggle to Calendar

## Tasks
- [x] Edit index.html: Add checkbox "Show Predicted Periods" in calendar header
- [x] Edit script.js: Add global variable `showPredictedPeriods` (default false)
- [x] Edit script.js: Add event listener to checkbox to toggle `showPredictedPeriods` and re-render calendar
- [x] Edit script.js: Create helper function `isPredictedPeriodDay(dateStr)`
- [x] Edit script.js: Modify `renderCalendar()` to add 'predicted-period' class to days that are predicted period days
- [x] Edit style.css: Add CSS styling for `.predicted-period` class (light red background)
- [ ] Test: Open index.html in browser, navigate to calendar, toggle option, verify highlighting of future period days
- [ ] Test: Check navigation to different months works correctly
