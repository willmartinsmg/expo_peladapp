import { View, Text, Image, StyleSheet } from 'react-native';
import { useThemedStyles } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';

interface AvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: number;
}

export function Avatar({ name, avatarUrl, size = 80 }: AvatarProps) {
  const styles = useThemedStyles((scheme) => createStyles(scheme, size));

  const getInitials = (name?: string): string => {
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (avatarUrl) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.initials}>{getInitials(name)}</Text>
    </View>
  );
}

const createStyles = (scheme: ColorScheme, size: number) => StyleSheet.create({
  container: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: Colors[scheme].primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: '#FFFFFF',
    fontSize: size * 0.4,
    fontWeight: 'bold',
  },
});
