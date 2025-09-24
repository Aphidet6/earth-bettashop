# Earth BettaShop - โครงสร้างโฟลเดอร์ Next.js

## 📁 โครงสร้างโปรเจค

```
src/
├── app/                    # Next.js 13+ App Router (หน้าเว็บต่างๆ)
│   ├── page.tsx          # หน้าแรก (/)
│   ├── layout.tsx        # Layout หลัก
│   ├── globals.css       # CSS หลัก
│   ├── about/            # หน้าเกี่ยวกับเรา (/about)
│   ├── products/         # หน้าสินค้า (/products)
│   ├── cart/             # หน้าตะกร้าสินค้า (/cart)
│   ├── auth/             # หน้าล็อกอิน/สมัครสมาชิก (/auth)
│   ├── dashboard/        # หน้าแดชบอร์ด (/dashboard)
│   └── api/              # API Routes
│       └── betta/        # API สำหรับปลากัด
│
├── components/            # React Components
│   ├── ui/               # UI Components พื้นฐาน
│   │   ├── Button.tsx    # ปุ่มต่างๆ
│   │   └── Card.tsx      # การ์ดสำหรับแสดงข้อมูล
│   ├── layout/           # Layout Components
│   │   ├── Header.tsx    # ส่วนหัวเว็บไซต์
│   │   └── Footer.tsx    # ส่วนท้ายเว็บไซต์
│   ├── forms/            # Form Components
│   ├── features/         # Feature-specific Components
│   └── common/           # Common/Shared Components
│
├── hooks/                # Custom React Hooks
│   └── useToggle.ts      # Hook สำหรับ toggle state
│
├── lib/                  # External Libraries & Configurations
│   └── api.ts            # API client functions
│
├── utils/                # Utility Functions
│   └── format.ts         # Functions สำหรับ format ข้อมูล
│
├── types/                # TypeScript Type Definitions
│   └── index.ts          # Type definitions หลัก
│
└── styles/ (optional)    # Additional CSS/SCSS files
```

## 📖 คำอธิบายแต่ละโฟลเดอร์

### 🎯 `app/` - หน้าเว็บ (Pages)
- ใช้ **Next.js 13+ App Router**
- แต่ละโฟลเดอร์จะมีไฟล์ `page.tsx` สำหรับแต่ละหน้า
- `layout.tsx` สำหรับกำหนด layout ของหน้านั้นๆ
- `loading.tsx` สำหรับแสดง loading state
- `error.tsx` สำหรับจัดการ error

### 🧩 `components/` - Components
- **`ui/`** - Components พื้นฐาน (Button, Input, Card, Modal)
- **`layout/`** - Components ที่เกี่ยวกับ layout (Header, Footer, Sidebar)
- **`forms/`** - Form components (LoginForm, RegisterForm)
- **`features/`** - Components เฉพาะ feature (ProductCard, CartItem)
- **`common/`** - Components ที่ใช้ร่วมกัน (Loading, ErrorBoundary)

### 🪝 `hooks/` - Custom Hooks
- Custom React hooks สำหรับ logic ที่ใช้ซ้ำ
- ตัวอย่าง: `useAuth`, `useCart`, `useToggle`

### 📚 `lib/` - Libraries
- การตั้งค่า external libraries
- API clients
- Database connections
- Third-party integrations

### 🛠️ `utils/` - Utilities
- Helper functions ต่างๆ
- ตัวอย่าง: formatting, validation, constants

### 📝 `types/` - Types
- TypeScript type definitions
- Interfaces สำหรับ data models
- API response types

## 🚀 วิธีใช้งาน

### 1. สร้าง Component ใหม่
```tsx
// src/components/ui/Input.tsx
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function Input({ label, value, onChange }: InputProps) {
  return (
    <div>
      <label>{label}</label>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}
```

### 2. สร้างหน้าใหม่
```tsx
// src/app/contact/page.tsx
export default function ContactPage() {
  return (
    <div>
      <h1>ติดต่อเรา</h1>
      <p>หน้าติดต่อเรา</p>
    </div>
  );
}
```

### 3. ใช้ Hook
```tsx
// src/components/example/ExampleComponent.tsx
import { useToggle } from '@/hooks/useToggle';

export default function ExampleComponent() {
  const { isOpen, toggle } = useToggle();
  
  return (
    <div>
      <button onClick={toggle}>
        {isOpen ? 'ปิด' : 'เปิด'}
      </button>
      {isOpen && <div>เนื้อหาที่ซ่อน/แสดง</div>}
    </div>
  );
}
```

## 💡 Best Practices

1. **ใช้ PascalCase** สำหรับชื่อ component files
2. **ใช้ camelCase** สำหรับ utility functions และ hooks
3. **แยก concerns** - แต่ละโฟลเดอร์มีหน้าที่เฉพาะ
4. **สร้าง index.ts** สำหรับ export components ที่ใช้บ่อย
5. **ใช้ TypeScript** สำหรับ type safety

## 📦 การ Import

```tsx
// Import components
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';

// Import hooks
import { useToggle } from '@/hooks/useToggle';

// Import types
import { Product, User } from '@/types';

// Import utils
import { formatPrice } from '@/utils/format';
```

โครงสร้างนี้จะช่วยให้โปรเจค Next.js ของคุณเป็นระเบียบและง่ายต่อการพัฒนาต่อไป! 🎉