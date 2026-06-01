---
title: 'Sticky Sidebar — Left Menu Stationary on Scroll'
type: 'feature'
created: '2026-05-31'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** The left sidebar scrolled with the right-side content because `.main` had no overflow constraint, allowing its content to expand `.app` beyond `100vh` and scroll the entire page.

**Approach:** Make `.main` the scroll container (`overflow-y: auto`) so only the right column scrolls; apply `min-height: 0` to fix the standard flex-in-grid height leak, `overscroll-behavior-y: contain` to prevent elastic page bounce, and `scrollbar-gutter: stable` to prevent layout shift on Windows.

## Suggested Review Order

1. [`../../../pokermath/src/App.svelte`](../../../pokermath/src/App.svelte) — `.main` style block: four-line CSS change
