# Team Capacity Report

A quick **standard markdown table** (rendered by GFM) for the summary:

| Team      | Members | Utilization | On-call |
| --------- | ------: | ----------: | :-----: |
| Platform  |       8 |         82% |   Yes   |
| Mobile    |       5 |         74% |   No    |
| Data      |       6 |         91% |   Yes   |
| Design    |       4 |         63% |   No    |

For the detailed breakdown, here's an **interactive table** — click any header
to sort:

```table
{
  "title": "Open Issues by Assignee",
  "sortable": true,
  "columns": [
    { "key": "assignee", "label": "Assignee" },
    { "key": "open", "label": "Open", "align": "right" },
    { "key": "inProgress", "label": "In Progress", "align": "right" },
    { "key": "closedThisWeek", "label": "Closed (7d)", "align": "right" },
    { "key": "avgAgeDays", "label": "Avg Age (days)", "align": "right" }
  ],
  "rows": [
    { "assignee": "Ami", "open": 12, "inProgress": 3, "closedThisWeek": 9, "avgAgeDays": 4.2 },
    { "assignee": "Bo", "open": 7, "inProgress": 2, "closedThisWeek": 5, "avgAgeDays": 6.8 },
    { "assignee": "Chen", "open": 19, "inProgress": 5, "closedThisWeek": 11, "avgAgeDays": 3.1 },
    { "assignee": "Dana", "open": 4, "inProgress": 1, "closedThisWeek": 8, "avgAgeDays": 2.5 },
    { "assignee": "Eli", "open": 15, "inProgress": 4, "closedThisWeek": 6, "avgAgeDays": 9.4 }
  ]
}
```

Sorting is handled entirely client-side by the table renderer.
