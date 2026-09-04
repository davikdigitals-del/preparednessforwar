# View Count Formatting

## Format Rules

The `formatNumber()` utility function formats large numbers into readable short form:

| Input | Output | Description |
|-------|--------|-------------|
| 0-999 | Exact number | `999` |
| 1,000-9,999 | One decimal K | `1.5K`, `9.9K` |
| 10,000-999,999 | Whole K | `10K`, `999K` |
| 1,000,000-999,999,999 | One decimal M | `1.2M`, `999.9M` |
| 1,000,000,000+ | One decimal B | `1.5B` |

## Examples

```
999 → 999
1000 → 1K
1500 → 1.5K
9999 → 10K (rounds up)
10000 → 10K
45678 → 45K
999999 → 999K
1000000 → 1M
1234567 → 1.2M
1000000000 → 1B
```

## Updated Pages

- ✅ ArticlePage.tsx - Post view counts
- ✅ LatestPage.tsx - Latest posts view counts
- ✅ CommunityReports.tsx - Report view counts (2 locations)
- ✅ MyReports.tsx - User's own reports view counts
- ✅ MediaHubPage.tsx - Video/podcast view counts

## Usage

```typescript
import { formatNumber } from "@/utils/formatNumber";

// In your component
<span>{formatNumber(post.viewCount)} views</span>
<Eye className="w-4 h-4" />{formatNumber(report.views_count)}
```

## Alternative Format

For exact numbers with commas (admin tables, detailed analytics):

```typescript
import { formatNumberWithCommas } from "@/utils/formatNumber";

<span>{formatNumberWithCommas(1234567)}</span>
// Output: "1,234,567"
```
