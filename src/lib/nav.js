export const NAV_ITEMS = [
  { label: 'صفحه اصلی', to: '/' },
  { label: 'درباره ما', to: '/about' },
  { label: 'حوزه‌های فعالیت', to: '/activities' },
  { label: 'پروژه‌های حمایتی', to: '/projects' },
  { label: 'گزارش‌ها', to: '/transparency' },
  { label: 'اخبار و مقالات', to: '/stories' },
  { label: 'تماس با ما', to: '/contact' },
]

export const FOOTER_QUICK_LINKS = [
  { label: 'صفحه اصلی', to: '/' },
  { label: 'پروژه‌های حمایتی', to: '/projects' },
  { label: 'حمایت مالی', to: '/donate' },
  { label: 'گزارش‌ها و شفافیت', to: '/transparency' },
]

export const FOOTER_ABOUT_LINKS = [
  { label: 'معرفی مجموعه', to: '/about' },
  { label: 'مأموریت و اهداف', to: '/mission' },
  { label: 'حوزه‌های فعالیت', to: '/activities' },
  { label: 'همکاری و داوطلبی', to: '/volunteer' },
]

export const FOOTER_CONTACT_LINKS = [
  { label: 'تماس با ما', to: '/contact' },
  { label: 'فرم ارتباط', to: '/contact#form' },
  { label: 'اخبار و مقالات', to: '/stories' },
]

export const FOOTER_LEGAL_LINKS = [
  { label: 'سیاست حفظ حریم خصوصی', to: '/privacy' },
  { label: 'شرایط استفاده', to: '/terms' },
  { label: 'گزارش‌های مالی', to: '/transparency#reports' },
]

export const ADMIN_NAV = [
  { label: 'داشبورد', to: '/admin', icon: 'dashboard', end: true, write: false },
  { label: 'پروژه‌ها', to: '/admin/projects', icon: 'projects', write: true },
  { label: 'اخبار و مقالات', to: '/admin/stories', icon: 'stories', write: true },
  { label: 'حوزه‌های فعالیت', to: '/admin/activities', icon: 'activities', write: true },
  { label: 'صفحه‌ها', to: '/admin/pages', icon: 'pages', write: true },
  { label: 'گزارش‌های فعالیت', to: '/admin/reports', icon: 'reports', write: true },
  { label: 'رسانه و فایل‌ها', to: '/admin/media', icon: 'media', write: true },
  { label: 'کمک‌های ثبت‌شده', to: '/admin/donations', icon: 'donations', write: false },
  { label: 'درخواست‌های داوطلبی', to: '/admin/volunteers', icon: 'volunteers', write: true },
  { label: 'پیام‌ها و خبرنامه', to: '/admin/messages', icon: 'messages', write: true },
  { label: 'کاربران و دسترسی', to: '/admin/users', icon: 'users', write: true, adminOnly: true },
  { label: 'گزارش فعالیت مدیران', to: '/admin/audit', icon: 'audit', write: false, adminOnly: true },
  { label: 'تنظیمات سایت', to: '/admin/settings', icon: 'settings', write: true, adminOnly: true },
]

export const ROLE_LABELS = {
  admin: 'مدیر کل',
  editor: 'ویرایشگر محتوا',
  viewer: 'مشاهده‌گر',
}
