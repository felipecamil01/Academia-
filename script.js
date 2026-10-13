(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const whatsappNumber = '5545999916342'; // Public contact; verify before publishing.
  let activePlan = 'Mensal';
  let previousFocus = null;
  const modal = $('#modal-backdrop');
  const modalInner = $('#enroll-modal');
  const step1 = $('#form-step-1');
  const step2 = $('#form-step-2');
  const toggle = $('#menu-toggle');
  const navLinks = $('#nav-links');

  $('#year').textContent = new Date().getFullYear();

  function closeMenu() {
    navLinks.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });
  $$('#nav-links a').forEach(link => link.addEventListener('click', closeMenu));

  function setStep(n) {
    step1.classList.toggle('hidden', n !== 1);
    step2.classList.toggle('hidden', n !== 2);
    $('#step-label-1').classList.toggle('current', n === 1);
    $('#step-label-2').classList.toggle('current', n === 2);
    $('#form-error').textContent = '';
    if (n === 2) setTimeout(() => $('#person-name').focus(), 35);
    else $('#go-to-details').focus();
  }
  function openModal(plan) {
    activePlan = plan;
    previousFocus = document.activeElement;
    $('#chosen-plan').textContent = plan.toUpperCase();
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    setStep(1);
    setTimeout(() => modalInner.focus(), 40);
  }
  function closeModal() {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    $('#form-step-2').reset();
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }
  $$('[data-open-plan]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.openPlan)));
  $('#modal-close').addEventListener('click', closeModal);
  $('#choose-other-plan').addEventListener('click', () => { closeModal(); $('#planos').scrollIntoView({behavior:'smooth'}); });
  $('#go-to-details').addEventListener('click', () => setStep(2));
  $('#back-to-plan').addEventListener('click', () => setStep(1));
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('visible')) closeModal();
    if (event.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
    if (event.key !== 'Tab' || !modal.classList.contains('visible')) return;
    const focusable = $$('button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href]',modalInner).filter(el=>el.offsetParent!==null);
    if(!focusable.length) return;
    const first=focusable[0], last=focusable[focusable.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  });
  $('#person-phone').addEventListener('input', event => {
    const d = event.target.value.replace(/\D/g,'').slice(0,11);
    let value=d;
    if(d.length>2) value = '('+d.slice(0,2)+') '+d.slice(2);
    if(d.length>7) value = '('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);
    event.target.value = value;
  });
  $('#form-step-2').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#person-name').value.trim();
    const phone = $('#person-phone').value.replace(/\D/g,'');
    const email = $('#person-email').value.trim();
    const goal = $('#person-goal').value;
    const consent = $('#person-consent').checked;
    const error = $('#form-error');
    if(name.length<2){error.textContent='Informe seu nome para continuar.';$('#person-name').focus();return;}
    if(phone.length<10 || phone.length>11){error.textContent='Informe um WhatsApp com DDD válido.';$('#person-phone').focus();return;}
    if(email && !$('#person-email').validity.valid){error.textContent='Confira o endereço de e-mail.';$('#person-email').focus();return;}
    if(!consent){error.textContent='Confirme que deseja enviar seus dados pelo WhatsApp.';$('#person-consent').focus();return;}
    const message=[
      'Olá, equipe Rhino Gym! 👋',
      '',
      'Gostaria de consultar o plano '+activePlan+' e saber as condições de matrícula.',
      '',
      'Nome: '+name,
      'WhatsApp: '+$('#person-phone').value,
      ...(email ? ['E-mail: '+email] : []),
      'Objetivo: '+goal,
      '',
      'Podem me passar os valores e a disponibilidade?'
    ].join('\n');
    const url='https://wa.me/'+whatsappNumber+'?text='+encodeURIComponent(message);
    // Called only from explicit form submission. No data is sent from the website itself.
    const opened=window.open(url,'_blank','noopener,noreferrer');
    if(!opened){ window.location.href=url; }
  });
  // Subtle progressive reveal; functional even when observer is unavailable.
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}});
    },{threshold:.08,rootMargin:'0px 0px 40px 0px'});
    $$('.plan-card,.step,.intro-main,.location-layout,.section-heading-row').forEach(el=>{el.classList.add('reveal');observer.observe(el);});
  }
})();
