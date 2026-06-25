// Shared severity scale for feedback ratings.
//
// Scale (set by the Submit Feedback form):
//   1 = Mild   ·  2 = Low  ·  3 = Moderate  ·  4 = High  ·  5 = Critical
// Higher = more severe, so colors go green → red as the number climbs.

export function severityMeta(rating) {
  switch (Math.round(rating)) {
    case 5:
      return { label: 'Critical', text: 'text-red-400', bg: 'bg-red-500/10', badge: 'bg-red-500/20 text-red-400', solid: 'bg-red-600' };
    case 4:
      return { label: 'High', text: 'text-orange-400', bg: 'bg-orange-500/10', badge: 'bg-orange-500/20 text-orange-400', solid: 'bg-orange-600' };
    case 3:
      return { label: 'Moderate', text: 'text-amber-400', bg: 'bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-400', solid: 'bg-amber-500' };
    case 2:
      return { label: 'Low', text: 'text-lime-400', bg: 'bg-lime-500/10', badge: 'bg-lime-500/20 text-lime-400', solid: 'bg-lime-600' };
    default:
      return { label: 'Mild', text: 'text-green-400', bg: 'bg-green-500/10', badge: 'bg-green-500/20 text-green-400', solid: 'bg-green-600' };
  }
}
