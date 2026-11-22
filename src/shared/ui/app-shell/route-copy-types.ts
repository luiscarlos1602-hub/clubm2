export type RouteCopy = {
  /** Etiqueta en el menú. */
  readonly navLabel: string;
  /** h1 y <title>. */
  readonly title: string;
  /** Una frase: qué hará esta pantalla. */
  readonly phrase: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  /** Texto del enlace siguiente-paso. */
  readonly nextLabel: string;
};
