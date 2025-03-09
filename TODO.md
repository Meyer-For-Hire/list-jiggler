# Features to Implement

1. When creating a list, accept multiple items in one input field, either as:
  1. CSV format: comma-separated values using optional quotes to enclose list items which contain commas
  2. one-item-per-line format: each item is separated by a line break; this is for lists which are pasted in
2. Create a page which allows you to paste several URLs which contain different sortings of the same items and provides the following features:
  1. Validate that all the URLs are different sortings of the same list of items
  2. Display a sortable table of list items with three columns
    1. list item
    2. rankings: a comma-separated list of the rankings given
    3. RBO ranking: the ranking for this item which maximizes similarity to the majority of rankings using a rank-biased overlap method
  3. Provide a link to download the table as a CSV file
