# Revenue & Growth Overview

Here's how the business performed across 2025. Revenue climbed steadily through
the year, with the strongest jump in **Q4**.

```chart
{
  "type": "line",
  "title": "Monthly Revenue (2025, $K)",
  "xKey": "month",
  "series": [
    { "key": "revenue", "label": "Revenue" },
    { "key": "target", "label": "Target" }
  ],
  "data": [
    { "month": "Jan", "revenue": 120, "target": 110 },
    { "month": "Feb", "revenue": 132, "target": 120 },
    { "month": "Mar", "revenue": 145, "target": 135 },
    { "month": "Apr", "revenue": 150, "target": 145 },
    { "month": "May", "revenue": 168, "target": 155 },
    { "month": "Jun", "revenue": 181, "target": 170 },
    { "month": "Jul", "revenue": 195, "target": 185 },
    { "month": "Aug", "revenue": 210, "target": 200 },
    { "month": "Sep", "revenue": 225, "target": 210 },
    { "month": "Oct", "revenue": 248, "target": 225 },
    { "month": "Nov", "revenue": 270, "target": 245 },
    { "month": "Dec", "revenue": 312, "target": 270 }
  ]
}
```

Breaking revenue down **by product line** shows Platform overtaking Services:

```chart
{
  "type": "bar",
  "title": "Revenue by Product Line ($K)",
  "xKey": "quarter",
  "stacked": true,
  "series": [
    { "key": "platform", "label": "Platform" },
    { "key": "services", "label": "Services" },
    { "key": "support", "label": "Support" }
  ],
  "data": [
    { "quarter": "Q1", "platform": 140, "services": 180, "support": 60 },
    { "quarter": "Q2", "platform": 200, "services": 190, "support": 70 },
    { "quarter": "Q3", "platform": 280, "services": 200, "support": 80 },
    { "quarter": "Q4", "platform": 380, "services": 210, "support": 95 }
  ]
}
```

And the current **market share** split:

```chart
{
  "type": "pie",
  "title": "Market Share",
  "xKey": "name",
  "series": [{ "key": "value" }],
  "data": [
    { "name": "Us", "value": 42 },
    { "name": "Competitor A", "value": 28 },
    { "name": "Competitor B", "value": 18 },
    { "name": "Others", "value": 12 }
  ]
}
```
