import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PlayerPerformance {
  userId: number
  userName: string
  wins: number
  draws: number
  losses: number
  goals: number
  assists: number
  matches: number
}

interface CardTop3MelhoresProps {
  players: PlayerPerformance[]
  loading: boolean
  error: string | null
  matchesEvaluated: number
  onSeeMore?: () => void
  periodLabel?: string | null
  customTitle?: string
}

const getPlayerInitial = (name?: string) => {
  if (!name) return '?'
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

const CardTop3Melhores = ({
  players,
  loading,
  error,
  matchesEvaluated,
  onSeeMore,
  periodLabel,
  customTitle,
}: CardTop3MelhoresProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={24} color="#d97706" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {customTitle || 'Top 3 jogadores das últimas 5 semanas'}
            </Text>
            {periodLabel && !customTitle && (
              <Text style={styles.subtitle}>{periodLabel}</Text>
            )}
            <Text style={styles.criteria}>
              Critérios: vitórias → empates → derrotas → gols → assistências
            </Text>
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
          <Text style={styles.loadingText}>Calculando ranking dos craques...</Text>
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
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.userName}</Text>
                  <Text style={styles.playerGames}>
                    {player.matches} {player.matches === 1 ? 'jogo' : 'jogos'} avaliados
                  </Text>
                </View>
              </View>
              <View style={styles.playerStats}>
                <View style={styles.statsRow}>
                  <Text style={styles.statWins}>{player.wins}V</Text>
                  <Text style={styles.statDraws}>{player.draws}E</Text>
                  <Text style={styles.statLosses}>{player.losses}D</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statGoals}>
                    {player.goals} {player.goals === 1 ? 'gol' : 'gols'}
                  </Text>
                  <Text style={styles.statAssists}>
                    {player.assists} {player.assists === 1 ? 'assist.' : 'assists.'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Ainda não há partidas suficientes para montar o ranking.
        </Text>
      )}

      {!loading && !error && (
        <Text style={styles.footerText}>
          {matchesEvaluated > 0
            ? `${matchesEvaluated} ${matchesEvaluated === 1 ? 'partida' : 'partidas'} analisadas no período.`
            : 'Aguardando partidas concluídas para gerar o ranking.'}
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
    backgroundColor: '#fef3c7',
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
  criteria: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  seeMoreButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
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
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d97706',
  },
  playerInfo: {
    flex: 1,
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
  playerStats: {
    gap: 4,
    paddingLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statWins: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  statDraws: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  statLosses: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  statGoals: {
    fontSize: 14,
    color: '#374151',
  },
  statAssists: {
    fontSize: 14,
    color: '#374151',
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

export default CardTop3Melhores
