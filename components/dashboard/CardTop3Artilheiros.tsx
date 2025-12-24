import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PlayerSummary {
  userId: number
  userName: string
  totalGoals: number
  totalAssists: number
  matchdayCount: number
}

interface CardTop3ArtilheirosProps {
  players: PlayerSummary[]
  loading: boolean
  error: string | null
  periodLabel?: string | null
  matchdaysEvaluated: number
  onSeeMore?: () => void
  customTitle?: string
}

const getPlayerInitial = (name?: string) => {
  if (!name) return '?'
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

const CardTop3Artilheiros = ({
  players,
  loading,
  error,
  periodLabel,
  matchdaysEvaluated,
  onSeeMore,
  customTitle,
}: CardTop3ArtilheirosProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="football" size={24} color="#1d4ed8" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {customTitle || 'Top 3 artilheiros das últimas 5 semanas'}
            </Text>
            {periodLabel && !customTitle && (
              <Text style={styles.subtitle}>{periodLabel}</Text>
            )}
          </View>
        </View>
        {onSeeMore && (
          <TouchableOpacity style={styles.seeMoreButton} onPress={onSeeMore}>
            <Text style={styles.seeMoreText}>Ver relatório completo</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6b7280" />
          <Text style={styles.loadingText}>Buscando estatísticas...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : players.length > 0 ? (
        <View style={styles.playersList}>
          {players.map((player, index) => (
            <View key={player.userId} style={styles.playerRow}>
              <View style={styles.playerLeft}>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{index + 1}º</Text>
                </View>
                <View style={styles.playerAvatar}>
                  <Text style={styles.avatarText}>{getPlayerInitial(player.userName)}</Text>
                </View>
                <View>
                  <Text style={styles.playerName}>{player.userName}</Text>
                  {player.matchdayCount > 0 && (
                    <Text style={styles.playerGames}>
                      {player.matchdayCount} {player.matchdayCount === 1 ? 'jogo' : 'jogos'} no
                      período
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.playerRight}>
                <Text style={styles.goalsCount}>{player.totalGoals}</Text>
                <Text style={styles.goalsLabel}>
                  {player.totalGoals === 1 ? 'gol' : 'gols'}
                </Text>
                {player.totalAssists > 0 && (
                  <Text style={styles.assistsInfo}>
                    + {player.totalAssists}{' '}
                    {player.totalAssists === 1 ? 'assistência' : 'assistências'}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Nenhum gol registrado nas últimas 5 semanas.</Text>
      )}

      {!loading && !error && (
        <Text style={styles.footerText}>
          {matchdaysEvaluated > 0
            ? `${matchdaysEvaluated} ${matchdaysEvaluated === 1 ? 'jogo' : 'jogos'} analisados no período.`
            : 'Sem jogos com estatísticas registradas no período.'}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 16,
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  seeMoreButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  seeMoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  playersList: {
    gap: 16,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d4ed8',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  playerGames: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  playerRight: {
    alignItems: 'flex-end',
  },
  goalsCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  goalsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  assistsInfo: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  footerText: {
    marginTop: 16,
    fontSize: 14,
    color: '#9ca3af',
  },
})

export default CardTop3Artilheiros
