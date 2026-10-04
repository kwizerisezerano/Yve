<?php

namespace App\Service\Ip;

use App\Entity\IpAddress;
use App\Entity\Queue;
use App\Entity\Type\WarmupStatus;
use App\Entity\WarmupSchedule;
use App\Service\Server\ServerService;
use Doctrine\ORM\EntityManagerInterface;

readonly class IpSelector
{
    public function __construct(
        private EntityManagerInterface $em,
        private ServerService $serverService,
    ) {}

    public function selectForQueue(Queue $queue, int $recipientCount = 1): ?IpAddress
    {
        $server = $this->serverService->getServerByCurrentHostname();

        if ($server === null) {
            return null;
        }

        /** @var IpAddress[] $ips */
        $ips = $this->em
            ->createQuery(
                '
                SELECT ip
                FROM App\Entity\IpAddress ip
                WHERE ip.queue = :queue
                  AND ip.server = :server
                ',
            )
            ->setParameter('queue', $queue)
            ->setParameter('server', $server)
            ->getResult();

        if (empty($ips)) {
            return null;
        }

        /** @var WarmupSchedule[] $warmups */
        $warmups = $this->em
            ->createQuery(
                '
                SELECT ws
                FROM App\Entity\WarmupSchedule ws
                WHERE ws.ip_address IN (:ips)
                  AND ws.status = :status
                ',
            )
            ->setParameter('ips', $ips)
            ->setParameter('status', WarmupStatus::WARMING->value)
            ->getResult();

        $warmupByIpId = [];

        foreach ($warmups as $ws) {
            $warmupByIpId[$ws->getIpAddress()->getId()] = $ws;
        }

        shuffle($ips);

        $conn = $this->em->getConnection();

        foreach ($ips as $ip) {
            $warmup = $warmupByIpId[$ip->getId()] ?? null;

            if ($warmup instanceof WarmupSchedule) {
                if ($warmup->getSentToday() + $recipientCount <= $warmup->getMaxToday()) {
                    $conn->executeStatement(
                        'UPDATE warmup_schedules
                         SET sent_today = sent_today + :count
                         WHERE id = :id',
                        [
                            'count' => $recipientCount,
                            'id' => $warmup->getId(),
                        ],
                    );

                    return $ip;
                }
            } else {
                return $ip;
            }
        }

        return null;
    }
}
