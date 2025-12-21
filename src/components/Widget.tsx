import React, { useState, useRef } from 'react';
import styles from './WidgetTester.module.css';

interface WidgetValidation {
  isValid: boolean;
  div?: string;
  scriptSrc?: string;
  widgetId?: string;
}

const WidgetTester: React.FC = () => {
  const [widgetCode, setWidgetCode] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [fadeOutError, setFadeOutError] = useState<boolean>(false);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const validateAndExtractWidget = (code: string): WidgetValidation => {
    const cleanCode = code.trim();

    // Regex para extraer el div con id y data-widget-id
    const divRegex =
      /<div\s+id=["']btp-valuation-widget["']\s+data-widget-id=["']([a-f0-9-]{36})["']\s*><\/div>/i;

    // Regex para validar que el script sea SOLO de cdn.betipo.es
    const scriptRegex =
      /<script\s+src=["'](https:\/\/cdn\.betipo\.es\/[a-zA-Z0-9_-]+\.js)["']\s*><\/script>/i;

    const divMatch = cleanCode.match(divRegex);
    const scriptMatch = cleanCode.match(scriptRegex);

    if (!divMatch || !scriptMatch) {
      return { isValid: false };
    }

    return {
      isValid: true,
      div: divMatch[0],
      scriptSrc: scriptMatch[1],
      widgetId: divMatch[1],
    };
  };

  const displayError = () => {
    setShowError(true);
    setFadeOutError(false);
    
    setTimeout(() => {
      setFadeOutError(true);
    }, 3500);
    
    setTimeout(() => {
      setShowError(false);
      setFadeOutError(false);
    }, 4000);
  };

  const loadWidget = () => {
    if (!containerRef.current || isWidgetLoaded) return;

    const validation = validateAndExtractWidget(widgetCode);

    if (!validation.isValid) {
      displayError();
      return;
    }

    const container = containerRef.current;
    container.innerHTML = '';

    // Crear el div del widget de forma segura
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'btp-valuation-widget';
    widgetDiv.setAttribute('data-widget-id', validation.widgetId!);
    container.appendChild(widgetDiv);

    // Cargar el script de forma segura
    const script = document.createElement('script');
    script.src = validation.scriptSrc!;
    script.async = true;

    script.onerror = () => {
      displayError();
      container.innerHTML = '';
    };

    script.onload = () => {
      setIsWidgetLoaded(true);
    };

    container.appendChild(script);
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <section className={styles.widgetTester}>
      <h1 className={styles.title}>WIDGET TOOL</h1>

      <div className={styles.inputSection}>
        <label htmlFor="widget-input" className={styles.label}>
          Pega el código aquí:
        </label>
        <textarea
          id="widget-input"
          className={styles.textarea}
          placeholder="código del widget..."
          rows={4}
          value={widgetCode}
          onChange={(e) => setWidgetCode(e.target.value)}
          disabled={isWidgetLoaded}
        />
        {!isWidgetLoaded ? (
          <button onClick={loadWidget} className={styles.button}>
            Cargar Widget
          </button>
        ) : (
          <>
            <div className={styles.infoMessage}>
              Widget cargado correctamente. Para probar otro widget, recarga la página.
            </div>
            <button onClick={reloadPage} className={styles.buttonSecondary}>
              Recargar Página (F5)
            </button>
          </>
        )}
        <div 
          className={`${styles.error} ${!showError ? styles.hidden : ''} ${fadeOutError ? styles.fadeOut : ''}`}
        >
          Código inválido
        </div>
      </div>

      <div ref={containerRef} className={styles.widgetContainer}></div>
    </section>
  );
};

export default WidgetTester;