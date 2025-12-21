import { useState, useRef } from 'react';
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
  const [buttonText, setButtonText] = useState<string>('Cargar Widget');
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
    setTimeout(() => {
      setShowError(false);
    }, 4000);
  };

  const loadWidget = () => {
    if (!containerRef.current) return;

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

    // Eliminar scripts anteriores del mismo src para evitar redeclaraciones
    const existingScripts = document.querySelectorAll(
      `script[src="${validation.scriptSrc}"]`
    );
    existingScripts.forEach((s) => s.remove());

    // Cargar el script de forma segura
    const script = document.createElement('script');
    script.src = validation.scriptSrc!;
    script.async = true;

    script.onerror = () => {
      displayError();
      container.innerHTML = '';
    };

    container.appendChild(script);

    // Cambiar texto del botón después de la primera carga
    setButtonText('Recargar Widget');
  };

  return (
    <section className={styles.widgetTester}>
      <h1 className={styles.title}>WIDGET TOOLS</h1>

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
        />
        <button onClick={loadWidget} className={styles.button}>
          {buttonText}
        </button>
        <div className={`${styles.error} ${showError ? '' : styles.hidden}`}>
          Código inválido
        </div>
      </div>

      <div ref={containerRef} className={styles.widgetContainer}></div>
    </section>
  );
};

export default WidgetTester;