import { colors } from './theme';

/** Estilo de header compartido por todos los stacks. */
export const opcionesStack = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.bg },
};
