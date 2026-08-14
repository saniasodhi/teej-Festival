/* ============================================================================
   detail — the expandable block under each section's copy

   One open at a time. Escape closes. The height animation lives in CSS; this
   only flips aria-expanded and the label, which is what drives it.
   ========================================================================= */

export function initDetail() {
  const triggers = Array.from(document.querySelectorAll('.chapter__more'));
  let open = null;

  const setOpen = (button, expanded) => {
    button.setAttribute('aria-expanded', String(expanded));
    button.querySelector('.chapter__more-label').textContent = expanded ? 'less' : 'more';
  };

  const close = () => {
    if (!open) return;
    setOpen(open, false);
    open = null;
  };

  for (const button of triggers) {
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      if (open && open !== button) setOpen(open, false);
      setOpen(button, !isOpen);
      open = isOpen ? null : button;
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !open) return;
    const button = open;
    close();

    // Return focus to the trigger, unless the visitor has already moved on to
    // some other control — then leave them where they are.
    const active = document.activeElement;
    const parked = !active
      || active === document.body
      || active.id === 'journey'
      || button.parentElement.contains(active);
    if (parked) button.focus();
  });

  return { close };
}
