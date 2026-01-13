
import React from 'react';

export default function DesignSystemPage() {
    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-label-900">
            <section className="space-y-4">
                <h2 className="text-h2 border-b pb-2">Typography</h2>
                <div className="space-y-2">
                    <p className="text-display">Display Text (3rem)</p>
                    <h1 className="text-h1">Heading 1 (2.25rem)</h1>
                    <h2 className="text-h2">Heading 2 (1.875rem)</h2>
                    <h3 className="text-h3">Heading 3 (1.5rem)</h3>
                    <h4 className="text-h4">Heading 4 (1.25rem)</h4>
                    <p className="text-body">Body Text (1rem) - The quick brown fox jumps over the lazy dog.</p>
                    <p className="text-body-sm">Small Body Text (0.875rem) - The quick brown fox jumps over the lazy dog.</p>
                    <p className="text-caption">Caption Text (0.75rem) - The quick brown fox jumps over the lazy dog.</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-h2 border-b pb-2">Buttons</h2>
                <div className="flex gap-4 flex-wrap">
                    <button className="btn btn-primary">Primary Button</button>
                    <button className="btn btn-secondary">Secondary Button</button>
                    <button className="btn btn-outline">Outline Button</button>
                    <button className="btn btn-ghost">Ghost Button</button>
                    <button className="btn btn-primary" disabled>Disabled Primary</button>
                </div>
            </section>

            <section className="space-y-4 max-w-md">
                <h2 className="text-h2 border-b pb-2">Forms</h2>
                <div className="space-y-4">
                    <div>
                        <label className="label">Email Address</label>
                        <input type="email" className="input" placeholder="name@example.com" />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input type="password" className="input" placeholder="Enter password" />
                    </div>
                    <div>
                        <label className="label">Disabled Input</label>
                        <input type="text" className="input" disabled placeholder="Cannot type here" />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-h2 border-b pb-2">Tabs</h2>
                <div className="tab-group">
                    <button className="tab active">Account</button>
                    <button className="tab">Password</button>
                    <button className="tab">Notifications</button>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-h2 border-b pb-2">Colors & Radius</h2>
                <div className="flex gap-4">
                    <div className="w-16 h-16 bg-primary rounded-md flex items-center justify-center text-white text-xs">Primary</div>
                    <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center text-white text-xs">Secondary</div>
                    <div className="w-16 h-16 bg-tertiary rounded-md flex items-center justify-center text-label-900 text-xs">Tertiary</div>
                    <div className="w-16 h-16 bg-status-correct rounded-md flex items-center justify-center text-white text-xs">Correct</div>
                    <div className="w-16 h-16 bg-status-error rounded-md flex items-center justify-center text-white text-xs">Error</div>
                </div>
                <div className="flex gap-4 items-end">
                    <div className="w-12 h-12 border border-line-400 rounded-2xs flex items-center justify-center text-xs">2xs</div>
                    <div className="w-12 h-12 border border-line-400 rounded-xs flex items-center justify-center text-xs">xs</div>
                    <div className="w-12 h-12 border border-line-400 rounded-sm flex items-center justify-center text-xs">sm</div>
                    <div className="w-12 h-12 border border-line-400 rounded-md flex items-center justify-center text-xs">md</div>
                    <div className="w-12 h-12 border border-line-400 rounded-lg flex items-center justify-center text-xs">lg</div>
                    <div className="w-12 h-12 border border-line-400 rounded-xl flex items-center justify-center text-xs">xl</div>
                    <div className="w-12 h-12 border border-line-400 rounded-2xl flex items-center justify-center text-xs">2xl</div>
                </div>
            </section>
        </div>
    );
}
