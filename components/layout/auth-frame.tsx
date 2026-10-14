import { Factory } from 'lucide-react'

// Centered brand frame shared by the login, sign-up and access-status screens
export function AuthFrame({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mb-4 shadow-lg">
                        <Factory className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">MUST ERP</h1>
                    <p className="text-gray-500 mt-1">ระบบจัดการการผลิต</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
                    {children}
                </div>

                {footer && <div className="text-center text-sm text-gray-500 mt-6">{footer}</div>}
            </div>
        </div>
    )
}
