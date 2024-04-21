declare interface ICommand {
    name: Lowercase<string>;
    description: string;
    defaultMemberPermissions?: string | number | bigint | null | undefined;
    subcommands?: ICommand[];
    options?: ApplicationCommandOptionBase[];
    developer?: boolean;

    isIndexer?: boolean;
    guardsman: Guardsman;

    execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction<"cached">): Promise<void>;
}

declare interface IEvent {
    name: string,
    function: () => Promise<void>
}

declare type ChannelConfiguration =
    {
        guild_id: string,
        channel_id: string,
        setting: string
    }

declare type StoredChannelConfiguration =
    {
        id: number,
        created_at: Date,
        updated_at: Date
    } & ChannelConfiguration

declare interface IGuildConfiguration {
    guild_id: string,
    settings?: string,
    moderator_roles?: string,
    muterole?: string,
    created_at: Date,
    updated_at: Date
}