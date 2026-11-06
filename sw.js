// Service worker: só existe para receber os avisos.
// Não guarda nada nem intercepta pedidos — a aplicação continua a ir
// sempre à rede, para não servir nunca uma versão velha.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (e) => {
  let dados = { title: 'Grupo Rabala App', body: 'Tens coisas por fazer na aplicação.', url: '/' }
  try {
    if (e.data) dados = { ...dados, ...e.data.json() }
  } catch {
    if (e.data) dados.body = e.data.text()
  }
  // No iPhone, um aviso que não se veja faz o sistema cancelar a subscrição:
  // por isso mostra-se sempre alguma coisa.
  e.waitUntil(self.registration.showNotification(dados.title, {
    body: dados.body,
    icon: '/icono.svg',
    badge: '/icono.svg',
    tag: 'resumo-diario',
    renotify: true,
    data: { url: dados.url || '/' },
  }))
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const destino = new URL(e.notification.data?.url || '/', self.location.origin).href
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const c of abertas) {
      if (c.url.startsWith(self.location.origin)) return c.focus()
    }
    return self.clients.openWindow(destino)
  })())
})
