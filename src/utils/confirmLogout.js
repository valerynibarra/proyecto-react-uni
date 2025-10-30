import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";

function LogoutModal({ onConfirm, onCancel }) {
    // cerrar con Escape
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") onCancel();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onCancel]);

    return (
        <div className="logout-modal" onClick={onCancel}>
            <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>¿Deseas cerrar sesión?</h3>
                <p>Tu sesión actual se cerrará y volverás al inicio de sesión.</p>
                <div className="logout-modal-buttons">
                    <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
                    <button className="btn-confirm" onClick={onConfirm}>Cerrar sesión</button>
                </div>
            </div>
        </div>
    );
}

export default function confirmLogout() {
    return new Promise((resolve) => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const root = createRoot(container);

        function clean(result) {
            try { root.unmount(); } catch (e) { /* ignore */ }
            if (container.parentNode) container.parentNode.removeChild(container);
            resolve(result);
        }

        root.render(
            <LogoutModal
                onConfirm={() => clean(true)}
                onCancel={() => clean(false)}
            />
        );
    });
}
